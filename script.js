// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEVH9HyJaltekyyC6QPTSomOaOxOKreBI",
    authDomain: "hicounter.firebaseapp.com",
    projectId: "hicounter",
    storageBucket: "hicounter.firebasestorage.app",
    messagingSenderId: "45149109689",
    appId: "1:45149109689:web:cd7806b759c1a09a7f0a68",
    measurementId: "G-7F3M1V3ED9"
};

// Initialize Firebase
// Initialize Firebase
// Initialize Firebase
// Initialize Firebase
// Initialize Firebase
// Initialize Firebase
// Initialize Firebase
// PLEASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// global
let userId = localStorage.getItem("hiUserId");
let personalCount;
let hiCounterText;
let hiSound;
let debounceTimeout;

const DEBOUNCE_DELAY = 500;  // delay between clicks

// Function to initialize user
async function initUser(userId, personalCount) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userHits = userSnap.data().hits || 0;
            personalCount.innerText = `Your HI's: ${userHits}`;
        } else {
            personalCount.innerText = `Your HI's: 0`;
        }
    } catch (error) {
        console.error("Error initializing user data:", error);
        if (personalCount) personalCount.innerText = `Your HI's: ERR`;
    }
}

// Function to check personal messages based on the count
function checkPersonalMessages(personalHits) {
    if (personalHits === 10) {
        alert("You have hit the HI button ten times. Please get real friends 😭");
    } else if (personalHits === 20) {
        alert("You okay??? 😬");
    } else if (personalHits === 30) {
        alert("stop hes just apng");
    } else if (personalHits === 50) {
        alert("DUDE. Get off. 💀");
    } else if (personalHits === 100) {
        document.getElementById("popupOverlay").style.display = "flex"; // Show popup
    }
}

// Function to check and initialize global counter
async function ensureCounterExists() {
    const docSnap = await getDoc(doc(db, "counters", "hiCounter"));
    if (!docSnap.exists() || docSnap.data().count === undefined) {
        await setDoc(doc(db, "counters", "hiCounter"), { count: 0 }, { merge: true });
        console.log("Counter initialized in Firestore.");
    }
}

// Function to load and show global counter
async function loadCounter() {
    try {
        const counterRef = doc(db, "counters", "hiCounter");
        const docSnap = await getDoc(counterRef);

        if (docSnap.exists() && docSnap.data().count !== undefined) {
            const globalCount = docSnap.data().count;
            hiCounterText.innerHTML = `TOTAL<br>HI's:<br>${globalCount}`;
        } else {
            hiCounterText.innerHTML = `TOTAL<br>HI's:<br>???`;
        }
    } catch (err) {
        console.error("Failed to load counter from Firestore:", err);
        hiCounterText.innerHTML = `TOTAL<br>HI's:<br>ERR`;
    }
}

// Function to increment global counter
async function incrementGlobalCounter() {
    try {
        const counterRef = doc(db, "counters", "hiCounter");
        await updateDoc(counterRef, {
            count: increment(1) // Increment the global counter by 1
        });

        // After incrementing
        await loadCounter();
    } catch (err) {
        console.error("Error incrementing global counter in Firestore:", err);
    }
}

// Function to debounce the incrementing action for both counters
const debouncedIncrement = async () => {
    //  debounce timeout, clear it
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    // Set a new timeout to delay the incrementing action
    debounceTimeout = setTimeout(async () => {
        // Increment global counter
        await incrementGlobalCounter();

        // Increment personal counter locally
        let personalHits = parseInt(localStorage.getItem("personalHits") || "0", 10);
        personalHits++;
        localStorage.setItem("personalHits", personalHits);

        if (personalCount) {
            personalCount.innerText = `Your HI's: ${personalHits}`;
        }

        // Check personal messages
        checkPersonalMessages(personalHits);

        // Update personal hits in Firestore
        try {
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { hits: increment(1) }, { merge: true });

            const userSnap = await getDoc(userRef);
            const userHits = userSnap.data().hits || 0;

            if (personalCount) {
                personalCount.innerText = `Your HI's: ${userHits}`;
            }
            checkPersonalMessages(userHits);
        } catch (err) {
            console.error("Failed to save personal hits to Firestore:", err);
        }
    }, DEBOUNCE_DELAY); // 500ms delay
};

// DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    // Grab all DOM elements now
    const bgMusic = document.getElementById("bgMusic");
    const turnOffButton = document.getElementById("turnOffButton");
    const hydrateButton = document.getElementById("hydrateButton");
    const hydrationBar = document.getElementById("hydrationBar");
    personalCount = document.getElementById("personalCount"); // Now global
    hiCounterText = document.getElementById("hiCounterText"); // Now global
    const hiButton = document.getElementById("hiButton");
    const closePopupButton = document.getElementById("closePopupButton");
    const popupOverlay = document.getElementById("popupOverlay");
    hiSound = document.getElementById("hiSound"); // Now global
    const hydrateSound = document.getElementById("hydrateSound");
    const pauseSound = document.getElementById("pauseSound");
    

    let hydrationLevel = 0;
    let joelDrowned = false;

    // Setup initial personal counter
    let personalHits = parseInt(localStorage.getItem("personalHits") || "0", 10);
    if (personalCount) {
        personalCount.innerText = `Your HI's: ${personalHits}`;
    } else {
        console.error("personalCount element not found.");
    }

    // Setup piano keys
    document.querySelectorAll(".piano-key").forEach(key => {
        key.addEventListener("click", () => {
            const note = key.dataset.note;
            const audio = document.getElementById(`note${note}`);
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
        });
    });

    // Turn off background music
    if (turnOffButton) {
        turnOffButton.addEventListener("click", () => {
            pauseSound.play();

            if (bgMusic.paused) {
                bgMusic.play();
                alert("banger");
            } else {
                bgMusic.pause();
                alert("screw your CENSHORCHIP");
            }
        });
    }

    // Hydrate button
    if (hydrateButton) {
        hydrateButton.addEventListener("click", () => {
            hydrationLevel += 10;
    
            if (hydrateSound) {
                hydrateSound.currentTime = 0; // rewind to start
                hydrateSound.play().catch(e => {
                    console.warn("Hydration sound failed to play:", e);
                });
            }
    
            if (hydrationLevel > 100 && !joelDrowned) {
                alert("too much wawa");
                joelDrowned = true;
                hydrationLevel = 100;
            }
    
            if (hydrationLevel === 100 && !joelDrowned) {
                alert("mo longer thirsty");
            }
    
            hydrationBar.style.width = `${hydrationLevel}%`;
        });
    }

    // Close popup
    if (closePopupButton) {
        closePopupButton.addEventListener("click", () => {
            popupOverlay.style.display = "none";
        });
    }

    // Hi button 
    if (hiButton) {
        hiButton.addEventListener("click", async () => {
            hiSound.play();
            // Debounced 
            await debouncedIncrement();
        });
    }

    // Firestore counter setup
    await ensureCounterExists();
    await loadCounter();
    await initUser(userId, personalCount);
});