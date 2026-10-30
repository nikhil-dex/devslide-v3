import mongoose from "mongoose";

const PptsSchema = new mongoose.Schema({
  // Indexed: both fields are queried on every My Decks load.
  userid: {
    type: String,
    required: true,
    index: true,
  },
  titles:{
    type: String,
    default: "untitled",
  },
 shareToken: {
  type: String,
  unique: true,
  sparse: true,
  index: true,
},
  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "private",
  },
  viewCount: {
    type: Number,
    default: 0,
},
passwordHash: {
    type: String,
    default: null,
},
  ppt_History: {
    type: Array,
    default: [],
  },
  // Emails of users this deck is shared with (it shows up in their My Decks).
  sharedWith: {
    type: [String],
    default: [],
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


export default mongoose.models.Ppts || mongoose.model("Ppts", PptsSchema);
