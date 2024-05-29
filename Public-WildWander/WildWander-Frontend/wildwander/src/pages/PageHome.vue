<template>
  <div class="overflow-hidden">
    <!-- Search bar with filter dropdown -->
    <div v-if="token" class="mb-4 mt-4 flex items-center justify-center">
      <input type="text" v-model="searchQuery"
        class="mx-2 form-input w-60 border border-gray-300 rounded-full px-3 py-2" placeholder="Search...">
      <select v-model="sortOrder" class="form-select border border-gray-300 rounded-full px-3 py-2">
        <option value="" disabled selected>Sort</option>  
        <option value="suitable">Capacity</option>
        <option value="size">Floor Area</option>
        <option value="rating">Rating</option>
      </select>
    </div>

    <!-- Available Accommodations -->
    <div class="flex flex-wrap mx-4 mt-4">
    <div v-for="spot in sortedSpots" :key="spot.id" class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/3 px-2 mb-4">
      <div 
        @click="token && showSpotDetails(spot)"
        class="p-4 border border-gray-200 rounded shadow cursor-pointer transition-transform hover:scale-105">
        <h2 class="font-bold text-xl mb-1 truncate">{{ spot.title }}</h2>
        <p class="text-gray-700 mb-4 truncate">{{ spot.location }}</p>
        <div class="flex justify-between text-sm text-gray-600 truncate">
          <span><strong>Capacity:</strong> {{ spot.suitableFor }}</span>
          <span><strong>Floor Area:</strong> {{ spot.size }}m²</span>
          <span><strong>Rating:</strong> {{ spot.rating }}</span>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: "PageHome",
  data() {
    return {
      spots: [],
      searchQuery: '',
      filterType: '',
      sortOrder: ''
    };
  },
  async mounted() {
    await this.fetchSpots();
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
    getUserIdFromToken() {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      if (token) {
        const decodedToken = atob(token.split('.')[1]);
        const tokenPayload = JSON.parse(decodedToken);
        return tokenPayload.nameid;
      } else {
        return 0;
      }
    },
    filteredSpots() {
      let filtered = this.spots;

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(spot => spot.title.toLowerCase().includes(query) || 
          spot.location.toLowerCase().includes(query)
        );
      }
      return filtered;
    },
    sortedSpots() {
      let sorted = this.filteredSpots;

      // Sort by rating
      if (this.sortOrder === 'rating') {
        sorted = sorted.sort((a, b) => b.rating - a.rating); // Sort in descending order
      }

      if (this.sortOrder === 'size') {
        sorted = sorted.sort((a, b) => b.size - a.size); // Sort in descending order
      }

      if (this.sortOrder === 'suitable') {
        sorted = sorted.sort((a, b) => b.suitableFor - a.suitableFor); // Sort in descending order
      }

      return sorted;
    }
  },
  methods: {
    async fetchSpots() {
      try {
        const response = await fetch("https://localhost:5001/Campingspot", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const spots = await response.json();
        this.spots = spots.filter(spot => spot.available && !spot.booked);
        this.spots.sort(() => Math.random() - 0.5);
      } catch (error) {
        console.error("Error fetching spots:", error);
      }
    },
    showSpotDetails(spot) {
      if (spot.userId == this.getUserIdFromToken) {
        this.$emit("changeActivePage", "SpotviewSpots", spot);
      } else {
        this.$emit("changeActivePage", "SpotviewHome", spot);
      }
    },
  },
};
</script>