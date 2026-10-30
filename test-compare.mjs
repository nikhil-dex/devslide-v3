import { compileDeck } from "./deck/compile.js";

const deck = {
  "version": 1,
  "theme": "netflix",
  "slides": [
    {
      "component": "image",
      "props": {
        "title": "Convolutional Neural Network",
        "image": "https://upload.wikimedia.org/wikipedia/commons/6/63/Typical_cnn.png",
        "caption": "Figure 1. Typical CNN Architecture"
      }
    }
  ]
}
const result = compileDeck(deck);

console.log(result);