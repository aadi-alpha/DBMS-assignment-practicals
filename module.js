// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

window.onload = function () {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDlpnsAM7VzcUVUB5Dfln9iOdWIGQtmGso",
    authDomain: "skillx-7b55c.firebaseapp.com",
    projectId: "skillx-7b55c",
    storageBucket: "skillx-7b55c.firebasestorage.app", // ✅ Correct bucket
    messagingSenderId: "805907988145",
    appId: "1:805907988145:web:4c5c06e3ce8027a118ac90",
    measurementId: "G-4JP775V103"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  const SubmitButton = document.getElementById("SubmitForm");
  const loader = document.getElementById("loader"); // 🔥 Loader element

  const minRoll = 240150800001;
  const maxRoll = 240150800070;
  const minDetlRoll = 240150825001;
  const maxDetlRoll = 240150825020;

  SubmitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const RollNum = document.getElementById("rollNum").value.trim();
    const name = document.getElementById("name").value.trim();
    const assignmentOneFile = document.getElementById("ass_one").files[0];
    const assignmentTwoFile = document.getElementById("ass_two").files[0];
    const assignmentThreeFile = document.getElementById("ass_three").files[0];
    const practicalFile = document.getElementById("practical").files[0];

    if (RollNum && name && assignmentOneFile && assignmentTwoFile && assignmentThreeFile && practicalFile) {
      if (
        (RollNum >= minRoll && RollNum <= maxRoll) ||
        (RollNum >= minDetlRoll && RollNum <= maxDetlRoll)
      ) {
        try {
          loader.style.display = "block"; // 🔥 Show loader
          SubmitButton.disabled = true; // Prevent multiple clicks

          const rollRef = doc(db, "DatabaseManagement", RollNum.toString());
          const snapshot = await getDoc(rollRef);

          if (snapshot.exists()) {
            alert("⚠️ This Roll Number has already submitted the form!");
            loader.style.display = "none";
            SubmitButton.disabled = false;
            return;
          }

          // Upload files to Firebase Storage
          const uploadFile = async (file, folder) => {
            const fileRef = ref(storage, `${folder}/${RollNum}_${file.name}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
          };

          const assignmentOneURL = await uploadFile(assignmentOneFile, "assignments");
          const assignmentTwoURL = await uploadFile(assignmentTwoFile, "assignments");
          const assignmentThreeURL = await uploadFile(assignmentThreeFile, "assignments");
          const practicalURL = await uploadFile(practicalFile, "practicals");

          // Save data in Firestore
          await setDoc(rollRef, {
            name: name,
            assignmentOne: assignmentOneURL,
            assignmentTwo: assignmentTwoURL,
            assignmentThree: assignmentThreeURL,
            practical: practicalURL,
            submittedAt: new Date().toISOString(),
          });

          alert("✅ Thanks for submission! Files uploaded successfully!");
        } catch (error) {
          console.error(error);
          alert("❌ Something went wrong. Check console for details.");
        } finally {
          loader.style.display = "none"; // 🔥 Hide loader
          SubmitButton.disabled = false; // Enable button again
        }
      } else {
        alert("❌ Enter a valid 12-digit roll number (e.g. 240150800001)");
      }
    } else {
      alert("⚠️ Please upload all assignments, practicals, and fill in all details!");
    }
  });
};
