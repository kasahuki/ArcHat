import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useContactStore = defineStore('contact', () => {
  // 存储所有好友信息
  const contacts = ref(new Map());
  
  // 存储当前正在聊天的用户ID
  const currentChatId = ref(null);

  // 添加或更新单个联系人
  const setContact = (contact) => {
    if (contact && contact.id) {
      contacts.value.set(contact.id, contact);
    }
  };

  // 批量添加联系人
  const setContacts = (contactList) => {
    if (Array.isArray(contactList)) {
      contactList.forEach(contact => {
        if (contact && contact.id) {
          contacts.value.set(contact.id, contact);
        }
      });
    }
  };

  // 根据ID获取联系人信息
  const getContactById = (id) => {
    return contacts.value.get(id);
  };

  // 设置当前聊天对象
  const setCurrentChat = (id) => {
    currentChatId.value = id;
  };

  // 获取当前聊天对象信息
  const getCurrentChat = () => {
    return currentChatId.value ? contacts.value.get(currentChatId.value) : null;
  };

  // 清除所有联系人信息
  const clearContacts = () => {
    contacts.value.clear();
    currentChatId.value = null;
  };

  return {
    contacts,
    currentChatId,
    setContact,
    setContacts,
    getContactById,
    setCurrentChat,
    getCurrentChat,
    clearContacts
  };
}, {
  // 为什么不加这个就不行！！！
  persist: {
    key: 'archat-contacts',
    storage: localStorage,
    paths: ['contacts', 'currentChatId'],
    serializer: {
      deserialize: (data) => {
        const parsed = JSON.parse(data);
        // 将普通对象转换回 Map
        if (parsed.contacts) {
          parsed.contacts = new Map(Object.entries(parsed.contacts));
        }
        return parsed;
      },
      serialize: (data) => {
        // 将 Map 转换为普通对象以便存储
        const serialized = { ...data };
        if (data.contacts instanceof Map) {
          serialized.contacts = Object.fromEntries(data.contacts);
        }
        return JSON.stringify(serialized);
      }
    }
  }
}); 
