<template>
  <div class="overflow-hidden my-8">
    <div class="flex flex-wrap mx-4">
      <!-- Existing spots loop -->
      <div v-for="spot in spots" :key="spot.id" class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/3 px-2 mb-4">
        <div @click="showSpotDetails(spot)" :class="{
        'bg-green-200': spot.available && !spot.booked,
        'bg-red-200': !spot.available && !spot.booked,
        'bg-orange-200': spot.booked
      }" class="p-4 border border-gray-200 rounded shadow cursor-pointer transition-transform hover:scale-105">
          <h2 class="font-bold text-xl mb-1 truncate">{{ spot.title }}</h2>
          <p class="text-gray-700 mb-4 truncate">{{ spot.location }}</p>
          <div class="flex justify-between text-sm text-gray-600 truncate">
            <span><strong>Capacity:</strong> {{ spot.suitableFor }}</span>
            <span><strong>Floor Area:</strong> {{ spot.size }}m²</span>
            <span><strong>Rating:</strong> {{ spot.rating }}</span>
          </div>
        </div>
      </div>
      <!-- Button to add new spot -->
      <div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/3 px-2 mb-4">
        <div @click="createNewSpotForm"
          class="p-4 border border-gray-200 rounded shadow cursor-pointer min-h-[120px] transition-transform hover:scale-105 flex justify-center items-center h-full">
          <span class="text-4xl">+</span>
        </div>
      </div>
    </div>
    <!-- Modal for adding a new spot -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Upload A New Spot</h2>
        <form @submit.prevent="createNewSpot">
          <div class="mb-4">
            <label for="title" class="block font-semibold">Title:</label>
            <input type="text" id="title" v-model="newSpot.title"
              class="form-input w-full border border-gray-300 rounded-md px-3 py-2" placeholder="My New Spot" required>
          </div>
          <div class="mb-4">
            <label for="location" class="block font-semibold">Location:</label>
            <input type="text" id="location" v-model="newSpot.location"
              class="form-input w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Street 23, Colorado, USA" required>
          </div>
          <div class="mb-4">
            <label for="berth" class="block font-semibold">Capacity:</label>
            <input type="number" id="berth" v-model="newSpot.suitableFor"
              class="form-input w-full border border-gray-300 rounded-md px-3 py-2" placeholder="5" required max="100" min="1">
          </div>
          <div class="mb-4">
            <label for="size" class="block font-semibold">Floor Area:</label>
            <input type="number" id="size" v-model="newSpot.size"
              class="form-input w-full border border-gray-300 rounded-md px-3 py-2" placeholder="50m²" required max="1000" min="1">
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeModal"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-4 w-32">
              Cancel
            </button>
            <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-32">
              Add Spot
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { displayAlert } from './spotview/helpers.js'

export default {
  name: "PageSpots",
  data() {
    return {
      spots: [],
      token: localStorage.getItem('token'),
      newSpot: {
        title: '',
        location: '',
        berth: '',
        size: '',
        userId: this.getUserIdFromToken,
        available: true,
        booked: true,
        rating: 5
      },
      showModal: false
    };
  },
  async mounted() {
    await this.fetchSpots();
    this.newSpot.userId = this.getUserIdFromToken;
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
  methods: {
    fetchSpots() {
      fetch(`https://localhost:5001/Campingspot/user/${this.getUserIdFromToken}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((spots) => {
          this.spots = spots;
        })
        .catch((error) => {
          console.error("Error fetching spots:", error);
        });
    },
    showSpotDetails(spot) {
      this.$emit("changeActivePage", "SpotviewSpots", spot);
    },
    createNewSpotForm() {
      this.showModal = true;
    },
    async createNewSpot() {
      const url = 'https://localhost:5001/Campingspot';
      this.newSpot.booked = false;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newSpot)
        });

        if (!response.ok) {
          throw new Error('Failed to create new spot');
        }

        this.newSpot = {
          title: '',
          location: '',
          berth: '',
          size: ''
        };
        displayAlert('New spot created successfully!');
        this.showModal = false;
        this.fetchSpots();
        setTimeout(() => {
          window.location.reload();
          }, 2000);
      } catch (error) {
        console.error('Error creating new spot:', error);
      }
    },
    closeModal() {
      this.showModal = false;
      this.newSpot = {
        title: '',
        location: '',
        berth: '',
        size: '',
        userId: this.getUserIdFromToken,
        available: true,
        booked: true
      };
    }
  }
};
</script>