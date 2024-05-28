<template>
  <div class="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
    <div class="flex flex-col lg:flex-row lg:space-x-8">
      <div class="flex-1 lg:order-2">
        <h1 class="text-4xl font-bold mb-4">{{ spot.title }}</h1>
        <p class="text-xl text-gray-700 mb-4 truncate">{{ spot.location }}</p>
        <div class="mb-6 flex items-center space-x-4">
          <p class="text-lg text-gray-600"><span class="font-semibold"><strong>Capacity:</strong></span> {{ spot.suitableFor }}</p>
          <p class="text-lg text-gray-600"><span class="font-semibold"><strong>Floor Area:</strong></span> {{ spot.size }}m²</p>
          <p class="text-lg text-gray-600"><span class="font-semibold"><strong>Rating:</strong></span> {{ spot.rating}}</p>
        </div>
        <button @click="setAvailableStatus(spot.id, !spot.available)"
          :class="spot.available ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
          class="text-white font-bold py-2 px-4 rounded-full">
          {{ spot.available ? 'Make unavailable' : 'Make available' }}
        </button>
        <button v-if="spot.booked == false" @click="confirmDeleteSpot(spot.id)"
          class="bg-red-800 hover:bg-red-950 text-white font-bold py-2 px-4 mx-2 rounded-full">
          Delete Spot
        </button>
        <button v-if="spot.booked == true" @click="confirmDeleteBooking(spot.id)"
          class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 mx-2 rounded-full">
          Vacate Campsite
        </button>
        <form v-if="useImages == true" @submit.prevent="uploadImage" class="mt-4">
          <input type="file" ref="fileInput" @change="onFileChangeAndUpload" class="hidden">
          <button type="button" @click="triggerFileInput"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Upload Image</button>
        </form>
      </div>
      <!-- Display images -->
      <div v-if="useImages == true" class="flex-1 lg:order-1">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Images</h2>
        <div v-if="images && images.length > 0" class="relative">
          <img :src="images[currentImageIndex].url" class="rounded-lg shadow-md object-cover h-48 w-48" />
        </div>
        <p v-else class="text-gray-600">No images available.</p>
      </div>
    </div>
    <!-- Display comments -->
    <div class="mt-10">
      <div>
        <button @click="toggleAllCommentsVisibility"
          class="text-2xl font-semibold mb-4 hover:text-gray-700 focus:outline-none transition duration-300">
          {{ allCommentsVisible ? '▼' : '▲' }} Comments
        </button>
      </div>
      <ul v-if="allCommentsVisible">
        <li v-for="comment in comments" :key="comment.id" class="border-b border-gray-200 py-4">
          <p class="text-gray-800"><span class="font-semibold">{{ getUsernameById(comment.userId) }}:</span> {{
          comment.commentText }}</p>
          <button v-if="comment.userId == getUserIdFromToken" @click="removeComment(comment.id)"
            class="text-sm text-red-500 hover:text-red-700 focus:outline-none transition duration-300">Remove</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { displayAlert } from './helpers.js'

export default {
  name: "PageSpotviewSpots",
  data() {
    return {
      comments: [], // Initialize comments array
      allCommentsVisible: true,
      newCommentText: "",
      images: [],
      usernames: [],
      currentImageIndex: 0,
      selectedFile: null,
      useImages: false
    };
  },
  props: {
    spot: {
      type: Object,
      required: true
    }
  },
  async mounted() {
    await this.fetchComments();
    await this.fetchUsernames();
    if (this.useImages) {
      this.fetchImages();
      await this.autoScrollImages();
    }
  },
  methods: {
    fetchUsernames() {
      fetch('https://localhost:5001/User/GETALLUSERNAMES')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          this.usernames = data;
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
    },
    getUsernameById(userId) {
      const user = this.usernames.find(user => user.id === userId);
      return user ? user.username : 'Anonymous';
    },
    confirmDeleteSpot(spotId) {
      if (confirm("Are you sure you want to delete this spot?")) {
        this.deleteSpot(spotId);
      }
    },
    confirmDeleteBooking(spotId) {
      if (confirm("Deleting a booking should only ever be used in case of emergencies, are you sure you want to delete the booking placed on your spot?")) {
        this.setBookingStatus(spotId);
      }
    },
    onFileChangeAndUpload(event) {
      this.selectedFile = event.target.files[0];
      this.uploadImage();
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async uploadImage() {
      if (!this.selectedFile) {
        alert("Please select a file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.selectedFile);

      const url = `https://localhost:5001/Image/addimage?campingspotid=${this.spot.id}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        this.selectedFile = null; // Clear the selected file
        displayAlert('Succesfully uploaded image!');
        await this.fetchImages(); // Refresh the image list
      } catch (error) {
        displayAlert('This image may not be uploaded, try using another image.');
        console.error('Error uploading image:', error);
      }
    },
    async removeComment(commentId) {
      // Function to remove a comment
      const url = `https://localhost:5001/Comment?commentid=${commentId}`;

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to remove comment');
        }

        await this.fetchComments(); // Refresh comments list
      } catch (error) {
        // Handle error
        console.error('Error removing comment:', error);
      }
    },
    toggleAllCommentsVisibility() {
      this.allCommentsVisible = !this.allCommentsVisible;
    },
    async fetchComments() {
      // Fetch comments from the server
      const url = `https://localhost:5001/Comment?campingspotid=${this.spot.id}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        this.comments = data; // Update comments array with fetched data
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    },
    async fetchImages() {
      try {
        const response = await fetch(`https://localhost:5001/Image?campingspotid=${this.spot.id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.images = data.map(image => ({
          id: image.id,
          url: `data:image/jpeg;base64,${image.imageData}`,
        }));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    },
    autoScrollImages() {
      setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      }, 5000); // Change image every 5 seconds
    },
    async setAvailableStatus(id, isAvailable) {
      const url = `https://localhost:5001/Campingspot/setavailablestatus?id=${id}&isAvailable=${isAvailable}`;

      try {
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to set available status of campingspot');
        }
        displayAlert('Succesfully set available status!');
        setTimeout(() => {
          this.$emit('changeActivePage', 'My Spots');
        }, 1000);
      } catch (error) {
        console.error('Error setting available status of campingspot:', error);
      }
    },
    async deleteSpot(id) {
      const url = `https://localhost:5001/Campingspot?id=${id}`;

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete the spot');
        }

        displayAlert('Succesfully deleted spot!');
        setTimeout(() => {
          this.$emit('changeActivePage', 'My Spots');
        }, 1000);
      } catch (error) {
        console.error('Error deleting the spot:', error);
      }
    },
    async setBookingStatus() {
      const campingspotUrl = `https://localhost:5001/Campingspot/setbookingstatus?id=${this.spot.id}&isBooked=false`;
      const bookingUrl = `https://localhost:5001/Booking/EmergencyDelete?campingspotid=${this.spot.id}`;

      try {
        // Set booking status of the camping spot
        const campingspotResponse = await fetch(campingspotUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!campingspotResponse.ok) {
          throw new Error('Failed to set booking status of campingspot');
        }


        // Delete the booking by user ID and camping spot ID
        const bookingResponse = await fetch(bookingUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!bookingResponse.ok) {
          throw new Error('Failed to delete booking');
        }


        // Display alert and navigate back to PageBookings
        displayAlert('Booking successfully removed!');
        setTimeout(() => {
          this.$emit('changeActivePage', 'My Spots');
        }, 1000);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
};
</script>

<style scoped>
.hidden {
  display: none;
}
</style>