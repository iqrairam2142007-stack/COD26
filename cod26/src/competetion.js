import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

// Inside your component:
const scoresQuery = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
const querySnapshot = await getDocs(scoresQuery);
