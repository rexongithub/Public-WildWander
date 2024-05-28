<template>
  <div class="overflow-hidden my-8 mx-4">
    <div class="flex flex-wrap mx-4">
      <!-- Existing spots loop -->
      <div v-for="spot in spots" :key="spot.id" class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/3 px-2 mb-4">
        <div @click="showSpotDetails(spot)" class="p-4 border border-gray-200 rounded shadow cursor-pointer transition-transform hover:scale-105">
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
        <div @click="GoHome" class="h-full">
          <div class="p-4 border border-gray-200 rounded shadow cursor-pointer min-h-[120px] transition-transform hover:scale-105 flex justify-center items-center h-full">
            <span class="text-4xl">+</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "PageBookings",
  data() {
    return {
      spots: [],
      token: localStorage.getItem('token'),
    };
  },
  async mounted() {
    await this.fetchSpotIds();
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
    GoHome() {
      this.$emit('changeActivePage', 'Home');
    },
    fetchSpotIds() {
  fetch(`https://localhost:5001/Booking/user/${this.getUserIdFromToken}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
  .then((spots) => {
    // Extract campingspotids and store them in an array
    const campingspotIds = spots.map(spot => spot.campingspotId);
    // Store campingspotIds in a separate array
    this.campingspotIds = campingspotIds;

    // Fetch all spots
    return fetch(`https://localhost:5001/Campingspot`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  })
  .then(response => response.json())
  .then(allSpots => {

    // Filter the spots based on the retrieved spot IDs
    const filteredSpots = allSpots.filter(spot => this.campingspotIds.includes(spot.id));

    // Continue with your logic here, using the filtered spots
    this.spots = filteredSpots;
  })
  .catch(error => {
    console.error("Error fetching spots:", error);
  });
},

    showSpotDetails(spot) {
      this.$emit("changeActivePage", "SpotviewBookings", spot);
    },
  },
};
</script>