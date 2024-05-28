<template>
  <div class="container mx-auto mx-4 my-8">
    <!-- User information -->
    <div class="mb-8">
      <div v-for="(value, key) in user" :key="key" class="flex justify-between items-center">
        <div class="py-4 border-b border-gray-300">
          <p v-if="key !== 'hashedPassword' && key !== 'id'"><span class="font-semibold">{{ formatKey(key) }}:</span> {{
          value }}</p>
        </div>
        <button v-if="key !== 'hashedPassword' && key !== 'id'" @click="handleClick(key, value)"
          class="text-blue-600 hover:font-semibold transition-transform hover:scale-105">Edit</button>
      </div>
    </div>

    <!-- Logout button -->
    <div class="text-right">
      <button @click="logout" class="text-red-600 hover:font-semibold transition-transform hover:scale-105">Logout</button>
    </div>

    <!-- Edit user form -->
    <form @submit.prevent="updateUser">
      <div v-if="showEditForm"
        class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
        <div class="max-w-md p-6 bg-white border rounded border-gray-300 relative">
          <button @click="closeEditForm" class="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-800">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <h2 class="text-3xl font-bold mb-6">Edit {{ formatKey(clickedKey) }}</h2>
          <div class="mb-6">
            <input type="text" :placeholder="currentValue" v-model="newValue" id="newValue"
              class="w-full px-4 py-3 border rounded border-gray-300">
          </div>
          <button type="submit" class="w-full bg-green-800 text-white font-bold py-3 px-6 rounded">Apply
            Changes</button>
          <p v-if="error" class="text-red-500 mt-6">{{ error }}</p>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { displayAlert } from './spotview/helpers.js'

export default {
  name: "PageUser",
  data() {
    return {
      user: {},
      token: localStorage.getItem('token'),
      showEditForm: false,
      clickedKey: '',
      currentValue: '',
      newValue: '',
      error: ''
    };
  },
  methods: {
    formatKey(key) {
      return key.toLowerCase().charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    },
    fetchUser() {
      fetch(`https://localhost:5001/User/${this.getUserIdFromToken}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((user) => {
          this.user = user; // Assign fetched user data to the user property
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    },
    updateUser() {
      const userId = this.getUserIdFromToken;
      // Validate email format
      if (this.clickedKey === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.newValue)) {
          this.error = 'Invalid email format';
          return; // Exit the method if the email format is invalid
        }
      }
      fetch(`https://localhost:5001/User/update${this.clickedKey}?userId=${userId}&new${this.clickedKey}=${this.newValue}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to update username');
          }
          this.getNewJwtFromUserId();
          displayAlert('Succesfully changed ' + this.formatKey(this.clickedKey) + '!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          this.showEditForm = false;
          this.error = '';
        })
        .catch(error => {
          this.error = error.message;
        });
    },
    getNewJwtFromUserId() {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      const url = `https://localhost:5001/User/jwt?id=${this.getUserIdFromToken}`;
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to login');
          }
          // Extract JWT token from response
          return response.text();
        })
        .then(token => {
          // Store JWT token securely (e.g., localStorage)
          document.cookie = `token=${token}; path=/`;
        })
        .catch(error => {
          this.error = error.message;
        });
    },
    logout() {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      displayAlert('Succesfully logged out!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    handleClick(key, value) {
      this.showEditForm = true;
      this.clickedKey = key;
      this.currentValue = this.user[key];
    },
    closeEditForm() {
      // Close the edit user form
      this.showEditForm = false;
      this.error = '';
      this.newValue = '';
    }
  },
  computed: {
    getUserIdFromToken() {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      if (token) {
        const decodedToken = atob(token.split('.')[1]);
        const tokenPayload = JSON.parse(decodedToken);
        return tokenPayload.nameid;
      } else {
        return 0;
      }
    }
  },
  async mounted() {
    await this.fetchUser();
  },
};
</script>