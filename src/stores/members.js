import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "src/boot/axios";

export const useMembersStore = defineStore("members", () => {
  const members = ref([]);
  const loading = ref(false);
  const inviting = ref(false);

  async function fetchAll(projectId) {
    loading.value = true;
    try {
      const { data } = await api.get("/api/members", { params: { projectId } });
      members.value = data.members ?? [];
    } finally {
      loading.value = false;
    }
  }

  async function invite(projectId, email) {
    inviting.value = true;
    try {
      const { data } = await api.post("/api/members/invite", {
        projectId,
        email,
      });
      members.value.push(data.member);
      return data.member;
    } finally {
      inviting.value = false;
    }
  }

  async function updateRole(projectId, memberId, role) {
    const { data } = await api.put("/api/members/update-role", { projectId, memberId, role });
    const idx = members.value.findIndex(m => m.id === memberId);
    if (idx !== -1) members.value[idx] = { ...members.value[idx], role };
    return data.member;
  }

  async function remove(projectId, memberId) {
    await api.delete("/api/members/delete", { data: { projectId, memberId } });
    members.value = members.value.filter((m) => m.id !== memberId);
  }

  function clear() {
    members.value = [];
  }

  return { members, loading, inviting, fetchAll, invite, updateRole, remove, clear };
});
