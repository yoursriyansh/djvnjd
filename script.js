import { awards } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis({
    autoRaf: true,
  });

  const awardsListContainer = document.querySelector(".awards-list");
  const awardPreview = document.querySelector(".award-preview");
  const awardsList = document.querySelector(".awards-list");

  const POSITIONS = {
    BOTTOM: 0,
    MIDDLE: -80,
    TOP: -160,
  };

  let lastMousePosition = { x: 0, y: 0 };
  let activeAward = null;
  let ticking = false;
  let mouseTimeout = null;
  let isMouseMoving = false;

  // Create award elements
  awards.forEach((award) => {
    const awardElement = document.createElement("div");
    awardElement.className = "award";

    awardElement.innerHTML = `
      <div class="award-wrapper">
        <div class="award-name">
          <h1>${award.name}</h1>
        </div>
        <div class="award-project">
          <h1>${award.project}</h1>
        </div>
        <div class="award-name">
          <h1>${award.name}</h1>
        </div>
      </div>
    `;

    awardsListContainer.appendChild(awardElement);
  });

  const awardsElements = document.querySelectorAll(".award");

  // Animation functions
  const animatePreview = () => {
    const awardsListRect = awardsList.getBoundingClientRect();
    if (
      lastMousePosition.x < awardsListRect.left ||
      lastMousePosition.x > awardsListRect.right ||
      lastMousePosition.y < awardsListRect.top ||
      lastMousePosition.y > awardsListRect.bottom
    ) {
      const previewImages = awardPreview.querySelectorAll("img");
      previewImages.forEach((img) => {
        gsap.to(img, {
          scale: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => img.remove(),
        });
      });
    }
  };

  const updateAwards = () => {
    animatePreview();

    if (activeAward) {
      const rect = activeAward.getBoundingClientRect();
      const isStillOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (!isStillOver) {
        const wrapper = activeAward.querySelector(".award-wrapper");
        const leavingFromTop = lastMousePosition.y < rect.top + rect.height / 2;

        gsap.to(wrapper, {
          y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = null;
      }
    }

    awardsElements.forEach((award) => {
      if (award === activeAward) return;

      const rect = award.getBoundingClientRect();
      const isMouseOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (isMouseOver) {
        const wrapper = award.querySelector(".award-wrapper");
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = award;
      }
    });

    ticking = false;
  };

  // Event listeners
  document.addEventListener("mousemove", (e) => {
    lastMousePosition.x = e.clientX;
    lastMousePosition.y = e.clientY;

    isMouseMoving = true;
    if (mouseTimeout) {
      clearTimeout(mouseTimeout);
    }

    const awardsListRect = awardsList.getBoundingClientRect();
    const isInsideAwardsList =
      lastMousePosition.x >= awardsListRect.left &&
      lastMousePosition.x <= awardsListRect.right &&
      lastMousePosition.y >= awardsListRect.top &&
      lastMousePosition.y <= awardsListRect.bottom;

    if (isInsideAwardsList) {
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
        const images = awardPreview.querySelectorAll("img");
        if (images.length > 1) {
          const lastImage = images[images.length - 1];
          images.forEach((img) => {
            if (img !== lastImage) {
              gsap.to(img, {
                scale: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => img.remove(),
              });
            }
          });
        }
      }, 2000);
    }

    if (!ticking) {
      requestAnimationFrame(() => {
        updateAwards();
      });
      ticking = true;
    }
  });

  document.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateAwards();
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Award hover effects
  awardsElements.forEach((award, index) => {
    const wrapper = award.querySelector(".award-wrapper");
    let currentPosition = POSITIONS.TOP;

    award.addEventListener("mouseenter", (e) => {
      activeAward = award;
      const rect = award.getBoundingClientRect();
      const enterFromTop = e.clientY < rect.top + rect.height / 2;

      if (enterFromTop || currentPosition === POSITIONS.BOTTOM) {
        currentPosition = POSITIONS.MIDDLE;
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      // Create a colored rectangle as a placeholder instead of an image
      const img = document.createElement("div");
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.backgroundColor = getColorForIndex(index);
      img.style.border = "1px solid #000";
      img.style.borderRadius = "4px";
      img.style.transform = "scale(0)";
      img.style.zIndex = Date.now();
      img.style.display = "flex";
      img.style.justifyContent = "center";
      img.style.alignItems = "center";
      img.style.color = "#fff";
      img.style.fontSize = "16px";
      img.style.fontWeight = "bold";
      img.style.textTransform = "uppercase";
      img.textContent = award.querySelector(".award-name h1").textContent;
      
      // Add to DOM with a class for easier selection
      img.classList.add("preview-item");
      awardPreview.appendChild(img);

      gsap.to(img, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    award.addEventListener("mouseleave", (e) => {
      activeAward = null;
      const rect = award.getBoundingClientRect();
      const leavingFromTop = e.clientY < rect.top + rect.height / 2;

      currentPosition = leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM;
      gsap.to(wrapper, {
        y: currentPosition,
        duration: 0.4,
        ease: "power2.out",
      });
      
      // Remove preview after a short delay (optional)
      setTimeout(() => {
        const previewItems = awardPreview.querySelectorAll(".preview-item");
        previewItems.forEach(item => {
          gsap.to(item, {
            scale: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => item.remove()
          });
        });
      }, 300);
    });
  });
  
  // Helper function to generate colors based on index
  function getColorForIndex(index) {
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    return colors[index % colors.length];
  }
});



const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);

function basicAnimate() {
  renderer.render(scene, camera);
  requestAnimationFrame(basicAnimate);
}
basicAnimate();

let model;
const loader = new THREE.GLTFLoader();
loader.load("./assets/chair.glb", function (gltf) {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        node.material.metalness = 2;
        node.material.roughness = 3;
        node.material.envMapIntensity = 5;
      }
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  scene.add(model);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 1.75;

  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);
  playInitialAnimation();

  cancelAnimationFrame(basicAnimate);
  animate();
});

const floatAmplitude = 0.01;
const floatSpeed = 1.5;
const rotationSpeed = 0.3;
let isFloating = true;
let currentScroll = 0;

const totalScrollHeight =
  document.documentElement.scrollHeight - window.innerHeight;

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1,
      ease: "power2.out",
    });
  }
}

lenis.on("scroll", (e) => {
  currentScroll = e.scroll;
});

function animate() {
  if (model) {
    if (isFloating) {
      const floatOffset =
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = floatOffset;
    }

    const scrollProgress = Math.min(currentScroll / totalScrollHeight, 1);

    const baseTilt = 0.5;
    model.rotation.x = scrollProgress * Math.PI * 4 + baseTilt;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// lenis scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
// canvas trail
// Canvas trail
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
let pauseTrail = false;

// Set canvas position and style
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "99999"; 
canvas.style.pointerEvents = "none"; // Prevent blocking mouse events
canvas.style.mixBlendMode = "difference";

// Function to properly size the canvas
function resizeCanvas() {
  // Get document dimensions - avoiding the arbitrary minimum height
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight,
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.body.clientHeight
  );
  
  const docWidth = Math.max(
    document.documentElement.scrollWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
    document.body.scrollWidth,
    document.body.offsetWidth,
    document.body.clientWidth
  );
  
  // Only update if dimensions are different to avoid clearing canvas unnecessarily
  if (canvas.width !== docWidth || canvas.height !== docHeight) {
    // Store current canvas content
    let tempCanvas = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
    }
    
    // Update canvas size
    canvas.width = docWidth;
    canvas.height = docHeight;
    
    // Restore drawing settings (they reset when canvas dimensions change)
    ctx.lineWidth = 24;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.54)";
    ctx.lineCap = "round";
    ctx.filter = "blur(12px)";
    
    // Restore previous content if it exists
    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }
}

// Initial canvas sizing
resizeCanvas();

// Variables to track mouse and scroll position
let xMousePos = 0;
let yMousePos = 0;
let lastScrolledLeft = 0;
let lastScrolledTop = 0;
let lastX = null;
let lastY = null;
let hasMouseMoved = false;

// Function to draw a line segment
function drawLine(newX, newY) {
  if (pauseTrail) {
    // Don't draw while over face, but update position
    lastX = newX;
    lastY = newY;
    return;
  }

  if (lastX !== null && lastY !== null) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
  }
  lastX = newX;
  lastY = newY;
}

// Set up face section event listeners
document.addEventListener("DOMContentLoaded", () => {
  const faceSection = document.querySelector('.footer');
  if (faceSection) {
    // Pause trail when mouse enters the face section
    faceSection.addEventListener('mouseenter', () => {
      pauseTrail = true;
    });

    // Resume trail when mouse leaves the face section
    faceSection.addEventListener('mouseleave', () => {
      pauseTrail = false;
      // Reset last position to avoid connecting lines across the face
      lastX = null;
      lastY = null;
    });
  }
});

// Track mouse movement
document.addEventListener("mousemove", function (event) {
  // Make sure canvas covers entire document
  resizeCanvas();
  
  if (!hasMouseMoved) {
    lastX = event.pageX;
    lastY = event.pageY;
    hasMouseMoved = true;
  } else {
    xMousePos = event.pageX;
    yMousePos = event.pageY;
    drawLine(xMousePos, yMousePos);
  }
});

// Adjust for scrolling
window.addEventListener("scroll", function () {
  // Make sure canvas covers entire document
  resizeCanvas();
  
  const xScrollDelta = window.scrollX - lastScrolledLeft;
  const yScrollDelta = window.scrollY - lastScrolledTop;

  if (xScrollDelta !== 0 || yScrollDelta !== 0) {
    xMousePos += xScrollDelta;
    yMousePos += yScrollDelta;
    drawLine(xMousePos, yMousePos);
  }

  lastScrolledLeft = window.scrollX;
  lastScrolledTop = window.scrollY;
});

// Handle window resizing
window.addEventListener("resize", resizeCanvas);

// Periodically check document size (helpful for dynamically loaded content)
setInterval(resizeCanvas, 1000);

// Detect when new content might be added (for dynamic pages)
const observer = new MutationObserver(function(mutations) {
  setTimeout(resizeCanvas, 100);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});