import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
let pfpList = "";
let roundProgress = "";
let started = "";
let nameListIndex = "";
let nameList = "";
let rounds = "";
let selectedIndices = "";
let selectedImages = [];




app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/", async (req, res) => {
  try {
    const result = await axios.get("https://api.jikan.moe/v4/top/anime?limit=15&filter=bypopularity");

    const images = result.data.data.map(anime => anime.images.jpg.large_image_url);

    started = false;



    // Generate 5 unique random indices
    const randomIndices = [];
    while (randomIndices.length < 10) {
      const randomIndex = Math.floor(Math.random() * images.length);
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
      }
    }

    // Select images based on the random indices
    selectedImages = randomIndices.map(index => images[index]);

    res.render("index.ejs", {
      backgroundImage1: selectedImages[0],
      backgroundImage2: selectedImages[1],
      backgroundImage3: selectedImages[2],
      backgroundImage4: selectedImages[3],
      backgroundImage5: selectedImages[4],
      backgroundImage6: selectedImages[5],
      backgroundImage7: selectedImages[6],
      backgroundImage8: selectedImages[7],
      backgroundImage9: selectedImages[8],
      backgroundImage10: selectedImages[9],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch anime data.");
  }
});


app.post("/", async (req, res) => {
  try {

    rounds = req.body.rounds;
    const category = req.body.category;
     if (!rounds || !category) {
      return res.render('index.ejs', {
        backgroundImage1: selectedImages[0],
        backgroundImage2: selectedImages[1],
        backgroundImage3: selectedImages[2],
        backgroundImage4: selectedImages[3],
        backgroundImage5: selectedImages[4],
        backgroundImage6: selectedImages[5],
        backgroundImage7: selectedImages[6],
        backgroundImage8: selectedImages[7],
        backgroundImage9: selectedImages[8],
        backgroundImage10: selectedImages[9]
      });
    }

    if (!started) {
      const result2 = await axios.get(`https://api.jikan.moe/v4/top/characters?limit=20`);


      // Map the data into separate lists
      const pfpTemp = result2.data.data.map(anime => anime.images.jpg.image_url);
      const nameTemp = result2.data.data.map(names => names.name);

      // Shuffle indices to select random characters
      const shuffledIndices = Array.from({ length: pfpTemp.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);

      // Select "round" number of items from the shuffled indices
      selectedIndices = shuffledIndices.slice(0, rounds);
      pfpList = selectedIndices.map(index => pfpTemp[index]);
      nameList = selectedIndices.map(index => nameTemp[index]);

      started = true;
      roundProgress = 1;
      nameListIndex = 0;
    }



    res.render("starting.ejs", {
      nameListIndex: nameListIndex,
      rounds: rounds,
      pfpList: pfpList,
      category: category,
      roundProgress: roundProgress,
      nameList: nameList,

    });
  } catch (error) {
    console.error("Failed to process form submission:", error);
    return res.render('index.ejs', { error: "An error occurred. Please try again." });
  }
});

app.post("/start-game", async (req, res) => {

  try {
    const guess = req.body.guess;

    // Check if the game has ended
    if (nameListIndex == rounds) {
      return res.render("index.ejs", { message: "Game Over !" });
    }

    // Check if the guess is correct
    if (
      guess === nameList[nameListIndex].split(" ")[0] ||
      guess === nameList[nameListIndex].split(" ")[1] ||
      guess === nameList[nameListIndex]
    ) {
      roundProgress++;
      nameListIndex++;

    } else {
      // Render the "wrong guess" EJS file
      return res.render("wrongGuess.ejs", {
        message: "Incorrect Guess! Try again next time.",
        correctAnswer: nameList[nameListIndex],
        roundProgress: roundProgress
      });
    }

    // Check again if the game has ended after processing the round
    if (nameListIndex == rounds) {
      return res.redirect('/');
    }

    // Continue the game if the guess was correct
    res.render("starting.ejs", {
      roundProgress: roundProgress,
      nameListIndex: nameListIndex,
      nameList: nameList,
      pfpList: pfpList
    });
  } catch (error) {
    console.error("Failed to process form submission:", error);
    res.render("index.ejs", { error: "An error occurred while processing your guess." });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



