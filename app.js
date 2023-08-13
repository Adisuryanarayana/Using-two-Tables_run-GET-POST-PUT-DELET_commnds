const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const databasepath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let database = null;

const instalizerDbAndServer = async () => {
  try {
    database = await open({
      filename: databasepath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

instalizerDbAndServer();

//movie table to convert to pascalcase

const convertMovieDbObjectToResponseObject = (databaseObject) => {
  return {
    movieId: databaseObject.movie_id,
    directorId: databaseObject.director_id,
    movieName: databaseObject.movie_name,
    leadActor: databaseObject.lead_actor,
  };
};

//director table to convert to pascalcase

const convertDirectorDbObjectToResponseObject = (databaseObject) => {
  return {
    directorId: databaseObject.director_id,
    directorName: databaseObject.director_name,
  };
};

//1 Retun a list of all movie names in the movie table

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
       movie_name
    FROM
       movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// 3 Return a movie based on the movie ID

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
       *
    FROM
       movie
    WHERE
       movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

// Create a new movie in the movie table. movie id is auto incremented

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
      movie (director_id, movie_name, lead_actor)
  VALUES
     (${directorId}, '${movieName}','${leadActor}');`;
  await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// 4 Update the details of a movie in the movie table base on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
     movie_id = ${movieId};`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie table based on movie iD

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// Returns a list of all directors in the director table

app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `SELECT * FROM director;`;
  const directorArray = await database.all(getAllDirectorQuery);
  response.send(
    directorArray.map((eachdirector) =>
      convertDirectorDbObjectToResponseObject(eachdirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT 
       movie_name
    FROM
       movie
    WHERE
       director_id = '${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
