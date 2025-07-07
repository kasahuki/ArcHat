import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export const useContactStore = defineStore('contact', () => {
  // 存储所有好友信息
  const contacts = ref(new Map());
  // 新增：存储所有群聊信息
  const groupChats = ref(new Map());
  
  // 存储当前正在聊天的用户ID
  const currentChatId = ref(null);

  // 添加或更新单个联系人（私聊）
  const setContact = (contact) => {
    if (contact && contact.id) {
      contacts.value.set(contact.id, contact);
    }
  };

  // 批量添加联系人（私聊）
  const setContacts = (contactList) => {
    if (Array.isArray(contactList)) {
      contactList.forEach(contact => {
        if (contact && contact.id) {
          contacts.value.set(contact.id, contact);
        }
      });
    }
  };

  // 批量添加群聊
  const setGroupChats = (groupList) => {
    if (Array.isArray(groupList)) {
      groupList.forEach(group => {
        if (group && group.id) {
          groupChats.value.set(group.id, group);
        }
      });
    }
  };

  // 根据ID获取群聊
  const getGroupChatById = (id) => {
    return groupChats.value.get(id);
  };

  // 根据ID获取联系人信息（私聊）
  const getContactById = (id) => {
    return contacts.value.get(id);
  };

  // 获取所有群聊
  const getAllGroupChats = () => {
    return Array.from(groupChats.value.values());
  };

  // 设置当前聊天对象
  const setCurrentChat = (id) => {
    currentChatId.value = id;
  };

  // 获取当前聊天对象信息（优先查私聊，再查群聊）
  const getCurrentChat = () => {
    if (!currentChatId.value) return null;
    return contacts.value.get(currentChatId.value) || groupChats.value.get(currentChatId.value) || null;
  };

  // 清除所有联系人信息
  const clearContacts = () => {
    contacts.value.clear();
    currentChatId.value = null;
  };

  // 删除单个联系人及其相关会话
  const removeContact = (userId) => {
    // 获取要删除的联系人信息
    const contact = contacts.value.get(userId);
    if (contact) {
      // 删除联系人
      contacts.value.delete(userId);
      
      // 如果当前正在与该联系人聊天，清除当前聊天ID
      if (currentChatId.value === userId) {
        currentChatId.value = null;
      }
    }
  };

  // 清空群聊
  const clearGroupChats = () => {
    groupChats.value.clear();
  };

  return {
    contacts,
    groupChats,
    currentChatId,
    setContact,
    setContacts,
    setGroupChats,
    getContactById,
    getGroupChatById,
    getAllGroupChats,
    setCurrentChat,
    getCurrentChat,
    clearContacts,
    clearGroupChats,
    removeContact
  };
}, {
  // 为什么不加这个就不行！！！
  persist: {
    key: 'archat-contacts',
    storage: localStorage,
    paths: ['contacts', 'groupChats', 'currentChatId'],
    serializer: {
      deserialize: (data) => {
        const parsed = JSON.parse(data);
        // 还原 contacts
        if (parsed.contacts) {
          parsed.contacts = new Map(Object.entries(parsed.contacts));
        }
        // 还原 groupChats
        if (parsed.groupChats) {
          parsed.groupChats = new Map(Object.entries(parsed.groupChats));
        }
        return parsed;
      },
      serialize: (data) => {
        const serialized = { ...data };
        if (data.contacts instanceof Map) {
          serialized.contacts = Object.fromEntries(data.contacts);
        }
        if (data.groupChats instanceof Map) {
          serialized.groupChats = Object.fromEntries(data.groupChats);
        }
        return JSON.stringify(serialized);
      }
    }
  }
}); 
