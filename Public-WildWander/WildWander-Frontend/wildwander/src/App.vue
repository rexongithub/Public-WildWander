<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="bg-green-800 shadow-md">
  <div class="container mx-auto px-4 py-3 flex justify-between items-center">
    <!-- Logo -->
    <a href="#" class="text-white text-xl font-semibold" @click="changeActivePage('Home')">WildWander</a>
    <!-- Menu -->
    <ul class="flex space-x-10">
      <!-- Buttons apart maken voor meer functionaliteit -->
      <li class="text-white cursor-pointer">
        <button :class="{ 'font-bold': activePage === 'Home', 'bg-green-500': activePage === 'Home' }" @click="changeActivePage('Home')"
          class="text-white cursor-pointer mr-10 transition-transform hover:scale-105 py-2 px-4 rounded-lg">Home</button>
        <button v-if="token" :class="{ 'font-bold': activePage === 'My Spots', 'bg-green-500': activePage === 'My Spots' }"
          @click="changeActivePage('My Spots')" class="text-white cursor-pointer mr-10 transition-transform hover:scale-105 py-2 px-4 rounded-lg">My Campsites</button>
        <button v-if="token" :class="{ 'font-bold': activePage === 'Bookings', 'bg-green-500': activePage === 'Bookings' }"
          @click="changeActivePage('Bookings')" class="text-white cursor-pointer mr-10 transition-transform hover:scale-105 py-2 px-4 rounded-lg">My Bookings</button>
        <button v-if="token && pages.includes('User')" :class="{ 'font-bold': activePage === 'User', 'bg-green-500': activePage === 'User' }"
          @click="changeActivePage('User')" class="text-white cursor-pointer transition-transform hover:scale-105 py-2 px-4 rounded-lg">{{ getFirstNameFromToken }}</button>
        <button v-if="!token" @click="showLoginForm = true" class="text-white cursor-pointer py-2 px-4 rounded-lg">Login</button>
      </li>
    </ul>
  </div>
</nav>




    <!-- Display login form when showLoginForm is true -->
    <div v-if="showLoginForm"
      class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <div class="login-container max-w-md p-6 bg-white border rounded border-gray-300 relative">
        <button @click="showLoginForm = false"
          class="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-800">
          <!-- Close icon (cross) -->
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 class="text-3xl font-bold mb-6">Login</h2>
        <form @submit.prevent="login">
          <div class="mb-6">
            <label for="username" class="block mb-2">Username:</label>
            <input type="text" id="username" v-model="username" class="w-full px-4 py-3 border rounded border-gray-300">
          </div>
          <div class="mb-6">
            <label for="password" class="block mb-2">Password:</label>
            <input type="password" id="password" v-model="password"
              class="w-full px-4 py-3 border rounded border-gray-300">
          </div>
          <button type="submit" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded">Login</button>
          <!-- Register link -->
          <p class="mt-2 text-center text-gray-600">No account? <a href="#"
              class="text-green-800 font-bold hover:underline" @click.prevent="showRegisterForm = true">Register
              now!</a></p>
        </form>
        <p v-if="error" class="text-red-500 mt-6">{{ error }}</p>
      </div>
    </div>

    <!-- Display register form when showRegisterForm is true -->
    <div v-if="showRegisterForm" class="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
      <div class="register-container max-w-md p-6 bg-white border rounded border-gray-300 relative">
        <button @click="showRegisterForm = false"
          class="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-800">
          <!-- Close icon (cross) -->
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 class="text-3xl font-bold mb-6">Register</h2>
        <form @submit.prevent="register">
          <div class="mb-4">
            <label for="registerUsername" class="block mb-2">Username:</label>
            <input type="text" id="registerUsername" v-model="registerUsername"
              class="w-full px-4 py-2 border rounded border-gray-300">
          </div>
          <div class="mb-4">
            <label for="registerEmail" class="block mb-2">Email:</label>
            <input type="email" id="registerEmail" v-model="registerEmail"
              class="w-full px-4 py-2 border rounded border-gray-300">
          </div>
          <div class="mb-4">
            <label for="registerFirstName" class="block mb-2">First Name:</label>
            <input type="text" id="registerFirstName" v-model="registerFirstName"
              class="w-full px-4 py-2 border rounded border-gray-300">
          </div>
          <div class="mb-4">
            <label for="registerLastName" class="block mb-2">Last Name:</label>
            <input type="text" id="registerLastName" v-model="registerLastName"
              class="w-full px-4 py-2 border rounded border-gray-300">
          </div>
          <div class="mb-4">
            <label for="registerPassword" class="block mb-2">Password:</label>
            <input type="password" id="registerPassword" v-model="registerPassword"
              class="w-full px-4 py-2 border rounded border-gray-300">
          </div>
          <button type="submit" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded">Register</button>
        </form>
        <p v-if="registerError" class="text-red-500 mt-6">{{ registerError }}</p>
      </div>
    </div>


    <!-- Pages -->
    <PageHome v-if="activePage === 'Home'" @changeActivePage="changeActivePage" />
    <PageSpots v-if="activePage === 'My Spots'" @changeActivePage="changeActivePage" />
    <PageUser v-if="activePage === 'User'" />
    <PageBookings v-if="activePage === 'Bookings'" @changeActivePage="changeActivePage" />


    <PageSpotviewHome v-if="activePage === 'SpotviewHome'" :spot="currentSpot" @changeActivePage="changeActivePage" />
    <PageSpotviewSpots v-if="activePage === 'SpotviewSpots'" :spot="currentSpot" @changeActivePage="changeActivePage" />
    <PageSpotviewBookings v-if="activePage === 'SpotviewBookings'" :spot="currentSpot"
      @changeActivePage="changeActivePage" />
  </div>
</template>

<script>

import PageHome from "./pages/PageHome.vue";
import PageSpots from "./pages/PageSpots.vue";
import PageUser from "./pages/PageUser.vue";
import PageBookings from "./pages/PageBookings.vue";

import PageSpotviewHome from "./pages/spotview/PageSpotviewHome.vue";
import PageSpotviewSpots from "./pages/spotview/PageSpotviewSpots.vue";
import PageSpotviewBookings from "./pages/spotview/PageSpotviewBookings.vue";

import { displayAlert } from './pages/spotview/helpers.js'

export default {
  name: 'App',
  components: {
    PageHome,
    PageSpots,
    PageUser,
    PageBookings,

    PageSpotviewHome,
    PageSpotviewSpots,
    PageSpotviewBookings
  },
  data() {
    return {
      activePage: "Home",
      currentSpot: null,
      currentBookingId: 1,
      pages: [
        "Home",
        "My Spots",
        "User",
        "Bookings",

        "SpotviewHome",
        "SpotviewSpots",
        "SpotviewBookings"
      ],
      showLoginForm: false,
      username: '',
      password: '',
      error: '',

      showRegisterForm: false,
      registerUsername: '',
      registerEmail: '',
      registerPassword: '',
      registerFirstName: '',
      registerLastName: '',
      registerError: '',
    }
  },

  async mounted() {
    // Check token expiration when the component is mounted
    // Check token expiration periodically (e.g., every minute)
    // Check every minute
    await this.checkTokenExpiration();
    setInterval(this.checkTokenExpiration, 60000);
  },

  computed: {
    token() {
      const cookie = document.cookie;
      if (cookie) {
        const tokenRow = cookie.split('; ').find(row => row.startsWith('token='));
        if (tokenRow) {
          return tokenRow.split('=')[1];
        }
      }
      return null;
    },
    getFirstNameFromToken() {
      if (this.token) {
        const decodedToken = atob(this.token.split('.')[1]);
        const tokenPayload = JSON.parse(decodedToken);
        return tokenPayload.unique_name;
      } else {
        return '';
      }
    }
  },

  methods: {
    changeActivePage(page, spot) {
      this.activePage = page;
      this.currentSpot = spot;
    },
    //alles login gerelateerd
    login() {
      const url = `https://localhost:5001/User/login?login=${this.username}&password=${this.password}`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to login');
          }
          // Extract JWT token from response
          return response.text();
        })
        .then(token => {
          document.cookie = `token=${token}; path=/`;

          // Reset form fields, clear error, and redirect
          this.error = '';
          displayAlert('Succesfully logged in!');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch(error => {
          this.error = error.message;
        });
    },

    async register() {
      const url = 'https://localhost:5001/User';
      const data = {
        username: this.registerUsername,
        email: this.registerEmail,
        firstName: this.registerFirstName,
        lastName: this.registerLastName,
        hashedPassword: this.registerPassword // Correctly set the hashedPassword field
      };


      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const responseText = await response.text(); // Read the response body as text

        if (!response.ok) {
          try {
            const errorData = JSON.parse(responseText);
            console.error("Failed to register: ", errorData);
            this.registerError = errorData.title || 'Failed to register';
          } catch (parseError) {
            console.error("Failed to register: ", responseText);
            this.registerError = responseText;
          }
          throw new Error('Failed to register');
        }

        // Attempt to parse the response text as JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (jsonError) {
          responseData = responseText;
        }

        this.registerError = '';
        this.registerUsername = '',
        this.registerEmail = '',
        this.registerPassword = '',
        displayAlert('Successfully registered!');
        this.showRegisterForm = false;
      } catch (error) {
        this.registerError = error.message;
        console.error("Error: ", error);
      }
    },

    checkTokenExpiration() {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = this.parseJwt(token);
        const expirationTime = decodedToken.exp * 1000; // Convert expiration time to milliseconds
        const currentTime = Date.now();
        if (currentTime >= expirationTime) {
          // Token has expired, remove it from local storage
          localStorage.removeItem('token');
          window.reload();
        }
      }
    },

    parseJwt(token) {
      // Parse JWT token and return its payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    },
  }
}
</script>