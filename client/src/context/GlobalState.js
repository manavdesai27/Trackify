import React, { createContext, useReducer, useEffect } from "react";
import AppReducer from "./AppReducer";
import axios from "axios";

// Initial state
const initialState = {
  token: null,
  user: null,
  errMsg: null,
  notification: null,
  isTracking: true,
  userLoading: false,
};


export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  //Actions
  async function loginUser(email, password) {
    try {
      dispatch({
        type: "UPDATE_USER_LOADING",
        payload: true,
      });

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = res.data.data;
      console.log(token, user, "token and user");

      dispatch({
        type: "UPDATE_USER_LOADING",
        payload: false,
      });

      // console.log(res);
      localStorage.setItem("auth-token", token);

      const notification = {
        type: "success",
        message: `Welcome back, ${user.name}!`,
      };

      dispatch({
        type: "LOGIN_USER",
        payload: { token, user, notification },
      });

      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    } catch (err) {
      dispatch({
        type: "UPDATE_USER_LOADING",
        payload: false,
      });

      dispatch({
        type: "LOG_ERROR_MESSAGE",
        payload: { message: err.response.data.error, notification: null },
      });
      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 5000);
    }
  }

  async function registerUser(displayName, email, password, confirmPassword) {
    try {
      dispatch({
        type: "UPDATE_USER_LOADING",
        payload: true,
      });

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/register`, {
        name: displayName,
        email,
        password,
      });
      // console.log(res.data.data);
      loginUser(email, password);
    } catch (err) {
      dispatch({
        type: "UPDATE_USER_LOADING",
        payload: false,
      });

      dispatch({
        type: "LOG_ERROR_MESSAGE",
        payload: { message: err.response.data.error, notification: null },
      });
      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 5000);
    }
  }

  function logoutUser() {
    // <Redirect exact to="/" />;
    localStorage.removeItem("auth-token");
    // redirect to login page
    
    const notification = {
      type: "success",
      message: `Successfully logged out!`,
    };
    
    dispatch({
      type: "LOGOUT_USER",
      payload: { notification },
    });

    // <Redirect push to="/" />;
    setTimeout(() => {
      dispatch({
        type: "CLEAR_LOGS",
        payload: null,
      });
    }, 100);
  }

  async function addTrack(trackUrl, name, expectedPrice) {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/track`,
        {
          userId: state.user.userId,
          trackUrl,
          name,
          reqPrice: expectedPrice,
        },
        { headers: { "user-auth-token": state.token } }
      );

      let notification;
      if (res.data.data.actualPrice === 0) {
        notification = {
          type: "warning",
          message: `Failed to track price, please report to us through the footer of homepage`,
        };
      } else {
        notification = {
          type: "success",
          message: `New product added!`,
        };
      }

      dispatch({
        type: "ADD_TRACK",
        payload: { data: res.data.data, notification },
      });
      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    } catch (err) {
      console.log("crawling failed", err);
      const notification = {
        type: "error",
        message: "Track Failed!",
        title:
          "Please try again or, contact host through the footer of the homepage",
      };

      dispatch({
        type: "LOG_ERROR_MESSAGE",
        payload: { message: null, notification },
      });

      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    }
  }

  async function editTrack(id, name, expectedPrice) {
    try {
      const tracks = state.user.addedUrls;
      const editedTrack = tracks.filter((track) => track._id === id);
      const editedTrackName = editedTrack[0].name;
      editedTrack[0].name = name;
      editedTrack[0].expectedPrice = expectedPrice;
      const prevTracks = tracks.filter((track) => track._id !== id);
      const newTracks = [...editedTrack, ...prevTracks];

      if (state.user.email !== "tester@mail.com") {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/track/${id}`,
          {
            name,
            reqPrice: expectedPrice,
          },
          { headers: { "user-auth-token": state.token } }
        );
      }

      const notification = {
        type: "info",
        message: `Product "${editedTrackName}" has been edited`,
      };

      dispatch({
        type: "UPDATE_TRACKS",
        payload: { data: newTracks, notification },
      });

      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    } catch {
      const notification = {
        type: "warning",
        message:
          "Error detected, please report to us through the footer of homepage",
      };

      dispatch({
        type: "LOG_ERROR_MESSAGE",
        payload: { message: null, notification },
      });

      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    }
  }

  async function deleteTracks(selectedTracks) {
    try {
      if (state.user.email !== "tester@mail.com") {
        console.log(selectedTracks);
        // backend update
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/delete/tracks`,
          { userId: state.user.userId, selectedTracks },
          { headers: { "user-auth-token": state.token } }
        );
      }

      const notification = {
        type: "success",
        message: `Successfully deleted!`,
      };

      console.log("selectedTracks", selectedTracks);

      // frontend update
      if (selectedTracks.length === state.user.addedUrls.length) {
        dispatch({
          type: "UPDATE_TRACKS",
          payload: { data: [], notification },
        });
      } else {
        const newTracks = state.user.addedUrls;
        selectedTracks.forEach((selectedTrack) => {
          const index = newTracks.indexOf(selectedTrack);
          if (index > -1) {
            newTracks.splice(index, 1);
          }
        });

        dispatch({
          type: "UPDATE_TRACKS",
          payload: { data: newTracks, notification },
        });
      }

      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    } catch {
      console.log("selectedTracks", selectedTracks);
      const notification = {
        type: "warning",
        message:
          "Error detected, please report to us through the footer of homepage",
      };

      dispatch({
        type: "LOG_ERROR_MESSAGE",
        payload: { message: null, notification },
      });

      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    }
  }

  async function multiTrack() {
    try {
      if (state.user.email === "tester@mail.com") {
        const notification = {
          type: "warning",
          message: `Track update is not available in guest mode!`,
        };
        dispatch({
          type: "LOG_ERROR_MESSAGE",
          payload: { message: null, notification },
        });
      } else if (state.user.addedUrls.length > 0) {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/multiTrack`,
          {
            userId: state.user.userId,
            createdTracks: state.user.addedUrls,
          },
          { headers: { "user-auth-token": state.token } }
        );
        // console.log(res.data.data);

        const notification = {
          type: "success",
          message: `All product has been updated!`,
        };
        dispatch({
          type: "MULTI_TRACK",
          payload: { data: res.data.data, notification },
        });
      } else {
        const notification = {
          type: "warning",
          message: `No product is detected!`,
        };
        dispatch({
          type: "LOG_ERROR_MESSAGE",
          payload: { message: null, notification },
        });
      }
      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    } catch (err) {
      console.log("crawling failed");
      const notification = {
        type: "error",
        message: "Track Failed!",
        title:
          "Please try again, or contact host through the footer of the homepage",
      };
      dispatch({
        type: "LOG_ERROR_MESSAGE",
        payload: { message: null, notification },
      });
      setTimeout(() => {
        dispatch({
          type: "CLEAR_LOGS",
          payload: null,
        });
      }, 100);
    }
  }

  // auto login START--------------------------------------------------------------
  async function checkLoggedIn() {
    try {
      let token = localStorage.getItem("auth-token");

      // if token hasn't been set
      if (token === null) {
        localStorage.setItem("auth-token", "");
        token = "";
      }

      const tokenRes = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/tokenIsValid`,
        null,
        {
          headers: { "user-auth-token": token },
        }
      );
      // get and login user data
      if (tokenRes.data) {
        const userRes = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/`,
          {
            headers: { "user-auth-token": token },
          }
        );

        dispatch({
          type: "LOGIN_USER",
          payload: { token, user: userRes.data, notification: null },
        });
      } else {
        dispatch({
          type: "LOGOUT_USER",
          payload: { notification: null },
        });
      }
    } catch (err) {
      console.log(err.response.data);
    }
  }

  useEffect(() => {
    checkLoggedIn();
  }, []);
  // auto login END--------------------------------------------------------------

  return (
    <GlobalContext.Provider
      value={{
        token: state.token,
        user: state.user,
        errMsg: state.errMsg,
        notification: state.notification,
        isTracking: state.isTracking,
        userLoading: state.userLoading,
        loginUser,
        registerUser,
        logoutUser,
        addTrack,
        editTrack,
        deleteTracks,
        multiTrack,
        checkLoggedIn,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
