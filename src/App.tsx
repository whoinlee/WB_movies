import { useState, useEffect, useCallback } from 'react';
//-- components
import Tile from './components/ui/Tile';
import MoviesHeader from './components/MoviesHeader';
import DummyPage from './components/DummyPage';
//-- contexts
import { HeaderMenuContext } from './context/HeaderMenuContext';
//-- data
import { MovieType } from './data/DataType';
import { API_MOVIE } from './data/tmdAPI';
//-- styles
import './styles/App.scss';


const MOVIES_PER_ROW = 5;
function App() {
  //-- movies related
  const numCols = MOVIES_PER_ROW;
  const [numRows, setNumRows] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  //-- header related
  const [onHeaderFocus, setOnHeaderFocus] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const headerMenus = ["Popular Movies", "Menu1","Menu2", "Menu3"];

  //-- get movies data
  useEffect(() => {
    const getMovies = async() => {
      const data = await(await fetch(API_MOVIE)).json();
      // console.log("data : ", data);
      const movies = data.results;
      const numOfMovies = movies.length;
      setMovies(movies);
      setNumRows(Math.round(numOfMovies/MOVIES_PER_ROW));
      setTotalMovies(numOfMovies);
      setDataLoaded(true);
    };
    getMovies();
  }, []);

  const onKeyDownHandler = useCallback((event:KeyboardEvent) => {
    // console.log("INFO App :: onKeyDownHandler", event.code);
    event.preventDefault();
    event.stopPropagation();

    switch (event.code) {
      case "ArrowDown":
        if (activeIndex === -1) {
          //-- move focus from header to movies grid
          setActiveIndex(0);
          setOnHeaderFocus(false);
        } else if (activeIndex < totalMovies - numCols) {
          setActiveIndex(activeIndex + numCols);
        }
        break;
      case "ArrowUp":
        if (activeIndex !== -1) {
          if (activeIndex > numRows) {
            setActiveIndex(activeIndex - numCols);
          } else {
            //-- move focus from movies grid to header
            setActiveIndex(-1);
            setOnHeaderFocus(true);
          }
        }
        break;
      case "ArrowRight":
        if (activeIndex <= totalMovies - 1 && activeIndex !== -1) {
          if (activeIndex % numCols === (numCols - 1)) {
            //-- if at the right end, move to the 1st tile of the row (circular)
            setActiveIndex(activeIndex - numCols + 1);
          } else {
            setActiveIndex(activeIndex + 1);
          }
        }
        break;
      case "ArrowLeft":
        if (activeIndex >= 0) {
          if (activeIndex % numCols === 0) {
            //-- if at the left end, move to the last tile of the row (circular)
            const lastIndex = (activeIndex + numCols - 1 >= totalMovies -1) ? 
                              totalMovies -1: activeIndex + numCols - 1;
            setActiveIndex(lastIndex);
          } else {
            setActiveIndex(activeIndex - 1);
          }
        }
        break;
      default:
        break;
    }
    // console.log("INFO App :: onKeyDownHandler, activeIndex?", activeIndex);
  }, [activeIndex, numRows, numCols, totalMovies]);
  
  //-- add listeners on mount, remove on unmount
  useEffect(() => {
    window.addEventListener("keydown", onKeyDownHandler);
    return () => {
      window.removeEventListener("keydown", onKeyDownHandler);
    };
  }, [onKeyDownHandler]);

  return (
    <div className="container">
      <HeaderMenuContext.Provider value={{
        activeMenuIndex,
        setActiveMenuIndex,
        onHeaderFocus,
        setOnHeaderFocus
      }}>
      <div className="movies">
        <MoviesHeader menus={headerMenus}/>
        {!dataLoaded ? (
            <p className="movies_loading">loading data...</p>
          ) : (
            (activeMenuIndex === 0) ? (
              <div className="movies_grid">
                { 
                  movies?.map((movie:MovieType, index) => 
                    <Tile key={movie.id} 
                          title={movie.title}
                          poster_path={movie.poster_path}
                          isOnFocus={(activeIndex === index)}
                    />
                  )
                }
              </div>
            ) : (
              <DummyPage />
            )
          )
        }
      </div>
      </HeaderMenuContext.Provider>
    </div>
  );
}

export default App;