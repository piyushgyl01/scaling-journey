import {
  usersCollection,
  postsCollection,
  commentsCollection,
} from "../db/connection";
import { User, Post, Comment } from "../types";

// load data from JSONPlaceholder
export async function loadData(): Promise<void> {
  try {
    // fetch 10 users
    console.log("Fetching users from JSONPlaceholder...");
    const usersResponse = await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );
    const allUsers: User[] = await usersResponse.json();
    const users = allUsers.slice(0, 10); // Get only 10 users

    // clear existing collections
    await usersCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    // insert users
    if (users.length > 0) {
      await usersCollection.insertMany(users);
    }

    // fetch posts for these users
    const userIds = users.map((user) => user.id);
    let allPosts: Post[] = [];

    console.log("Fetching posts for users...");
    for (const userId of userIds) {
      const postsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
      );
      const userPosts: Post[] = await postsResponse.json();
      allPosts = [...allPosts, ...userPosts];
    }

    // insert posts
    if (allPosts.length > 0) {
      await postsCollection.insertMany(allPosts);
    }

    // fetch comments for these posts
    const postIds = allPosts.map((post) => post.id);
    let allComments: Comment[] = [];

    console.log("Fetching comments for posts...");
    for (const postId of postIds) {
      const commentsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
      );
      const postComments: Comment[] = await commentsResponse.json();
      allComments = [...allComments, ...postComments];
    }

    // insert comments
    if (allComments.length > 0) {
      await commentsCollection.insertMany(allComments);
    }

    console.log(
      `Data loaded: ${users.length} users, ${allPosts.length} posts, ${allComments.length} comments`
    );
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}
