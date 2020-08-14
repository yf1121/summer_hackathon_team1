/* eslint-disable no-return-await */
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
// Firebase 初期化
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebaseのサービス取得
const db = firebase.firestore();
const firebaseAuth = firebase.auth();

// 基本データベース
const posts = db.collection('posts');
const latestposts = posts.orderBy('createdAt', 'desc');
const popularposts = posts.orderBy('fav', 'desc');

const users = db.collections('users');

// ポスト云々
const getPosts = (postSnapshot) => Promise.all(
  postSnapshot.docs
    .map((doc) => async () => {
      const user = firebase.collection('users')
        .doc(doc.data().userid)
        .get();
      return {
        user: user.data(),
        id: doc.id,
        ...doc.data(),
      };
    }),
);
const getLatestPosts = async (num) => {
  const latestPostsSnapshot = await (num ? latestposts.limit(num).get : latestposts.get)();
  return await getPosts(latestPostsSnapshot);
};
const getPopularPosts = async (num) => {
  const popularPostsSnapshot = await (num ? popularposts.limit(num).get : popularposts.get)();
  return await getPosts(popularPostsSnapshot);
};
const getUserPosts = async (userid) => {
  const userPostsSnapshot = await latestposts.where('userid', '==', userid).get();
  return await getPosts(userPostsSnapshot);
};
const createPost = (data) => (
  posts.doc(data.id).set(data)
);

// ユーザーの取得
const getUser = async (userid) => {
  const userSnapshot = await users.doc(userid).get();
  return {
    userid: userSnapshot.id,
    ...userSnapshot.data(),
  };
};
const setUser = (userdata) => users.doc().set(userdata);

export {
  firebaseAuth,
  getLatestPosts,
  getPopularPosts,
  getUserPosts,
  createPost,
  getUser,
  setUser,
};