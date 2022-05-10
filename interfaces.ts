
/**ShowsAPIInterface for TVMaze shows */

export interface ShowsAPIInterface {
  id: number;
  name: string;
  summary: string;
  image: {medium: string} | null;
}

/**ShowsResponseInterface for TVMaze shows */

export interface ShowsResponseInterface {
  id: number;
  name: string;
  summary: string;
  image: string ;
}

/**EpisodesInterface for TVMaze episodes */

export interface EpisodesInterface{
  id: number;
  name: string;
  season: number;
  number: number;
}

// export  {ShowsInterface,EpisodesInterface}
