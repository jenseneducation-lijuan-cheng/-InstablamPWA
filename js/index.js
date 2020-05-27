const publicVapidKey =
  "BA05iaT4jXt7j46p_UqS1wpIC8qizrdXKI-mZy3fbpWcBGlng1EcCMJI_MGCroPvR8h9YYXHlQjadx083naYwAw";
let sw;
let imgUrl;
// register SW
function registrateServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("../sw.js")
      .then((registration) => {
        console.log("Registered service worker");
      })
      .catch((error) => console.log("Error with register service worker " + error.toString() ));
  }
}

registrateServiceWorker();

// hämta sevice worker och spara den
if ("serviceWorker" in navigator && "PushManager" in window) {
  //Hämta våran service worker och sedan kolla om vi redan har en subscription
  navigator.serviceWorker.ready.then((pn) => {
    sw = pn;
    sw.pushManager.getSubscription().then((subscription) => {
      console.log("Is subscribed: ", subscription);
    });
    fixTogBtn();
  });
}

// send push notiser

async function notify() {
  const response = await fetch("http://localhost:8000/notification/send");
  const data = await response.json();
}
// starta subscription
async function subscribe(subscription) {
  const response = await fetch("http://localhost:8000/notification/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  });
  const data = await response.json();
}

async function fixTogBtn() {
    sw.pushManager.getSubscription().then(async (subscription) => {
        if (subscription) {
            document.getElementById("togBtn").checked = true;
        }
    })
}

document.getElementById("togBtn").addEventListener("change", (event) => {
  sw.pushManager.getSubscription().then(async (subscription) => {
    if (!event.srcElement.checked) {
      subscription.unsubscribe(); //Sluta prenumerera på push notiser
    } else {
      try {
        const subscribed = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        subscribe(subscribed);
        console.log(subscribed);
      } catch (error) {}
    }
  });
});

// Public base64 to Uint
function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// media device

async function getMedia() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const videoElem = document.querySelector("#me");
    videoElem.srcObject = stream;
    videoElem.addEventListener("loadedmetadata", () => {
      videoElem.play();
    });
    console.log(stream);
  } catch (error) {
    console.log(error);
  }
}

getMedia();

// ta kort
async function captureImage(stream) {
  const mediaTrack = stream.getVideoTracks()[0];
  console.log(mediaTrack);
  const captureImg = new ImageCapture(mediaTrack);
  const photo = await captureImg.takePhoto();
  console.log(photo);
  imgUrl = URL.createObjectURL(photo);
  console.log(imgUrl);
  document.querySelector("#photo").src = imgUrl;
  document.getElementById("inputs").classList.remove("invisible");
  document.getElementById("rdButton").classList.remove("invisibleButton");
 // byte image till caman för att kunna spara 
  Caman("#photo", function() {
      this.render();
  })
}

document.querySelector("#addImage").addEventListener("click", (event) => {
  removeP();
  captureImage(stream);
  notify();
});
// download camanjsPhoto
document.getElementById("download").addEventListener("click", (event) => {
  let e;
  const link = document.createElement("a");
  link.download = "fil.jpg";
  link.href = document.getElementById("photo").toDataURL("image/jpeg", 0.8);
  e = new MouseEvent("click");
  link.dispatchEvent(e);
});
// remove pic
function removeP(){
  let el = document.getElementById("photo");
  let pn = el.parentNode;
  pn.removeChild(el);
  let newImage = document.createElement("img");
  newImage.setAttribute("id", "photo");
  pn.appendChild(newImage);
  document.getElementById("inputs").classList.add("invisible");
  document.getElementById("rdButton").classList.add("invisibleButton");
}
 document.querySelector("#remove").addEventListener("click", (event) => {
     removeP();
  
});

// effect images
function updateImage(){
    Caman("#photo", imgUrl, function () {
        this.revert(false);
        
        document.querySelectorAll('.range').forEach(e => {
            console.log(e.id + " " + e.value);
            // e.value är en string, måste vara int
            let value = parseInt(e.value);
            if(e.id=="brightness") {
                this.brightness(value)
            } else if(e.id =="contrast") {
                this.contrast(value);

            }else if(e.id =="sepia"){
                this.sepia(value);
            }else if (e.id == "saturation"){
                this.saturation(value);
            }else if (e.id == "noise"){
                this.noise(value); 
            }else if (e.id == "vibrance"){
                this.vibrance(value);
            }
            
        });
        this.render();
    })

}

document.querySelectorAll('.range').forEach(e => {
  e.addEventListener('change',updateImage)
})