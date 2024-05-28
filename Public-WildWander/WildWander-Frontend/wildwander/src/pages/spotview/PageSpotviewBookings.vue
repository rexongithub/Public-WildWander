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
        <button @click="ratingFix" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">
      Vacate Campsite
    </button>
      </div>
      <!-- Display images -->
      <div v-if="useImages === true" class="flex-1 lg:order-1">
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
          <p class="text-gray-800"><span class="font-semibold">{{ getUsernameById(comment.userId) }}: </span> {{ comment.commentText }}</p>
          <button v-if="comment.userId == getUserIdFromToken" @click="removeComment(comment.id)"
            class="text-sm text-red-500 hover:text-red-700 focus:outline-none transition duration-300">Remove</button>
        </li>
      </ul>
      <form v-if="allCommentsVisible" @submit.prevent="addComment" class="mt-4 max-w-lg mx-auto">
      <div class="flex items-center border border-gray-300 rounded-full overflow-hidden focus-within:border-blue-500">
        <textarea v-model="newCommentText" rows="1" class="w-full p-2 border-none focus:outline-none resize-none"
          placeholder="Add your comment"></textarea>
        <transition enter-active-class="transition-opacity duration-500" enter-from-class="opacity-0"
          enter-to-class="opacity-100" leave-active-class="transition-opacity duration-500"
          leave-from-class="opacity-100" leave-to-class="opacity-0">
          <button v-if="newCommentText" type="submit"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 focus:outline-none">
            Send
          </button>
        </transition>
      </div>
    </form>
    </div>

    <!-- Rating Modal -->
    <div v-if="showRatingModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">Rate this spot</h2>
        <div class="flex justify-center mb-4">
          <button v-for="star in 5" :key="star" @click="setRating(star)" class="text-4xl cursor-pointer" :class="{'text-yellow-500': rating >= star, 'text-gray-300': rating < star}">
            ★
          </button>
        </div>
        <div class="flex justify-end">
          <button @click="closeRatingModal" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full">
            Cancel
          </button>
          <button @click="submitRating" class="ml-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full">
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { displayAlert } from "./helpers.js";

export default {
  name: "PageSpotviewBookings",
  data() {
    return {
      token: localStorage.getItem("token"),
      newCommentText: "",
      allCommentsVisible: true,
      comments: [],
      images: [],
      usernames: [],
      currentImageIndex: 0,
      useImages: false,
      showRatingModal: false,
      rating: 0,
    };
  },
  props: {
    spot: {
      type: Object,
      required: true,
    },
  },
  computed: {
    getUserIdFromToken() {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        .split("=")[1];
      if (token) {
        const decodedToken = atob(token.split(".")[1]);
        const tokenPayload = JSON.parse(decodedToken);
        return tokenPayload.nameid;
      } else {
        return 0;
      }
    },
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
        displayAlert("Your comment has been removed!")
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
    async addComment() {
      // Function to add a comment
      const url = "https://localhost:5001/Comment";
      const data = {
        userId: this.getUserIdFromToken,
        campingspotId: this.spot.id,
        commentText: this.newCommentText, // New comment text from form
      };
        // Check if the user has already commented
        for (let i = 0; i < this.comments.length; i++) {
          if (this.comments[i].userId == this.getUserIdFromToken) {
            displayAlert("You already commented on this spot!");
            return;
          }
        }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error("Failed to add comment");
        }
        // Handle success
        this.newCommentText = ""; // Clear the form after adding the comment
        displayAlert("Comment added successfully!");
        await this.fetchComments();
      } catch (error) {
        // Handle error
        console.error("Error adding comment:", error);
      }
    },
    async setBookingStatus() {
      const campingspotUrl = `https://localhost:5001/Campingspot/setbookingstatus?id=${this.spot.id}&isBooked=false`;
      const bookingUrl = `https://localhost:5001/Booking/DeleteBookingByUserAndSpotId?userid=${this.getUserIdFromToken}&campingspotid=${this.spot.id}`;

      try {
        // Set booking status of the camping spot
        const campingspotResponse = await fetch(campingspotUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!campingspotResponse.ok) {
          throw new Error("Failed to set booking status of campingspot");
        }


        // Delete the booking by user ID and camping spot ID
        const bookingResponse = await fetch(bookingUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!bookingResponse.ok) {
          throw new Error("Failed to delete booking");
        }

        displayAlert("Your booking has been canceled!");
      } catch (error) {
        console.error("Error:", error);
      }
    },
    setRating(star) {
      this.rating = star;
    },
    ratingFix(){
      this.showRatingModal = true;
    },
    async submitRating() {
      const ratingUrl = `https://localhost:5001/Campingspot/rating?campingspotid=${this.spot.id}&newrating=${this.rating}`;

      try {
        const response = await fetch(ratingUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to submit rating");
        }
        await this.setBookingStatus()
        this.$emit("changeActivePage", "Bookings");
        this.closeRatingModal();
      } catch (error) {
        console.error("Error submitting rating:", error);
      }
    },
    closeRatingModal() {
      this.showRatingModal = false;
    },
  },
};
</script>