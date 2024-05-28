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
        <button @click="book"
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300">
          Book spot
        </button>
      </div>
      <!-- Display images -->
      <div v-if="useImages" class="flex-1 lg:order-1">
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
      <p v-if="comments.length === 0 && allCommentsVisible" class="text-gray-600">There seems to be no comments for this spot yet.</p>
      <ul v-if="allCommentsVisible && comments.length > 0">
        <li v-for="comment in comments" :key="comment.id" class="border-b border-gray-200 py-4">
          <p class="text-gray-800"><span class="font-semibold">{{ getUsernameById(comment.userId) }}:</span> {{ comment.commentText }}</p>
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
  name: "PageSpotviewHome",
  data() {
    return {
      token: localStorage.getItem('token'),
      comments: [], // Initialize comments array
      allCommentsVisible: true,
      newCommentText: "",
      images: [],
      usernames: [],
      currentImageIndex: 0,
      useImages: false,
    };
  },
  props: {
    spot: {
      type: Object,
      required: true
    }
  },
  computed: {
    getUserIdFromToken() {
      // Function to extract user ID from token
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      if (token) {
        const decodedToken = atob(token.split('.')[1]);
        const tokenPayload = JSON.parse(decodedToken);
        return tokenPayload.nameid;
      } else {
        return 0; // Return default user ID if token is not found
      }
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
    async book() {
      // Function to book the spot
      const url = 'https://localhost:5001/Booking';
      const data = {
        campingspotId: this.spot.id,
        userId: this.getUserIdFromToken // Use computed property to get user ID
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error('Failed to book campingspot');
        }
        // Handle success
        await this.setBookingStatus(this.spot.id, true);
        displayAlert('Spot successfully booked!');
        setTimeout(() => {
          this.$emit('changeActivePage', 'Home');
        }, 1000);
      } catch (error) {
        // Handle error
        console.error('Error booking campingspot:', error);
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
        })); // Print the number of images fetched
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    },
    autoScrollImages() {
      setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      }, 5000); // Change image every 5 seconds
    },
    
    async setBookingStatus(id, isBooked) {
      // Function to set booking status
      const url = `https://localhost:5001/Campingspot/setbookingstatus?id=${id}&isBooked=${isBooked}`;
      try {
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to set booking status of campingspot');
        }
      } catch (error) {
        console.error('Error setting booking status of campingspot:', error);
      }
    }
  },
  async mounted() {
    await this.fetchComments();
    await this.fetchUsernames();
    if (this.useImages) {
      this.fetchImages();
      await this.autoScrollImages();
    }
  }
};
</script>