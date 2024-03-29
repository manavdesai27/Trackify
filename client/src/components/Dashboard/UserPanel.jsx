import React, { useContext, useState } from "react";
import PopupBtn from "../Popup/PopupBtn";
import { GlobalContext } from "../../context/GlobalState";
import axios from "axios";

export default function UserPanel() {
  const { user, token } = useContext(GlobalContext);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const createdTracks = user.addedUrls;

  // useEffect(() => {
  //   checkLoggedIn();
  // }, [createdTracks]);

  const handleVisitButton = (e, track) => {
    window.open(track.url, "_blank");
    console.log("button clicked");
  };

  const handleSwitchType = async (e, track) => {
    const id = track._id;
    console.log(track.notification);
    const slider = document.getElementById(`slider-${id}`);
    slider.checked = !slider.checked;

    await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/notif/track/${id}`,
      {
        notification: slider.checked,
      },
      { headers: { "user-auth-token": token } }
    );
    // setIsChecked((prevIsChecked) => !prevIsChecked);
  };

  function handleSelectTrack(e, track) {
    if (e.target.querySelector("input[type='checkbox']")) {
      const checkOnCard = e.target.querySelector("input[type='checkbox']");
      checkOnCard.checked = !checkOnCard.checked;
      updateSelectedTrack(checkOnCard, track);
    } else if (e.target.nodeName === "INPUT") {
      const checkOnCheckbox = e.target;
      updateSelectedTrack(checkOnCheckbox, track);
    }
  }

  function updateSelectedTrack(checkbox, selectedTrack) {
    if (checkbox.checked) {
      // check
      const newSelectedTracks = [...selectedTracks, selectedTrack];
      setSelectedTracks(newSelectedTracks);
    } else {
      // uncheck
      const newSelectedTracks = selectedTracks.filter(
        (track) => track !== selectedTrack
      );
      setSelectedTracks(newSelectedTracks);
    }
  }

  function handleSelectAllTracks(e) {
    const checkButtons = document.querySelectorAll(".check-btn");
    if (createdTracks.length > 0 && e.target.checked) {
      checkButtons.forEach((button) => {
        button.checked = true;
      });
      setSelectedTracks(user.addedUrls);
    } else if (createdTracks.length > 0 && !e.target.checked) {
      checkButtons.forEach((button) => {
        button.checked = false;
      });
      setSelectedTracks([]);
    }
  }

  // auto check checkAllBtn
  if (document.getElementById("checkAllBtn")) {
    const checkAllBtn = document.getElementById("checkAllBtn");
    if (
      createdTracks.length > 0 &&
      selectedTracks.length === createdTracks.length
    ) {
      checkAllBtn.checked = true;
    } else {
      checkAllBtn.checked = false;
    }
  }

  // show delete button if checked
  if (document.getElementById("deleteBtn")) {
    const deleteBtn = document.getElementById("deleteBtn");
    if (selectedTracks.length > 0) {
      deleteBtn.style.display = "inline-block";
    } else {
      deleteBtn.style.display = "none";
    }
  }

  return (
    <div className="user-panel">
      <div className="title my-3 mx-md-5 mx-4 bold">My Tracks</div>

      <div className="tracks">
        {/* actions */}
        <div className="actions my-4 all-center justify-content-start">
          <PopupBtn type="multiTrack">
            <button className="btn btn-primary btn-info btn-sm mr-2">
              Update all
            </button>
          </PopupBtn>

          <PopupBtn type="addTrack">
            <button className="btn btn-primary btn-sm">+</button>
          </PopupBtn>

          <PopupBtn
            type="deleteTrack"
            selectedTracks={selectedTracks}
            setSelectedTracks={setSelectedTracks}
          >
            {/* update selectedTracks */}
            <button
              className="btn btn-danger btn-sm mx-3"
              id="deleteBtn"
              style={{ display: "none" }}
            >
              <small className="m-0">Delete</small>
            </button>
          </PopupBtn>
        </div>

        {/* categories */}
        <div className="categories card mt-1 bg-transparent border-0">
          <div className="card-body">
            <div className="row text-capitalize px-1">
              <div>
                <input
                  type="checkbox"
                  id="checkAllBtn"
                  onClick={handleSelectAllTracks}
                />
              </div>
              <div className="col-sm-1 col-2 p-0 text-center"></div>
              <div className="col-xl-5 col-lg-4 col-sm-3 col-4 p-0">name</div>
              <div className="col-xl-1 col-md-2 col-3 d-sm-block d-none p-0">
                expected
              </div>
              <div className="col-xl-1 col-md-2 d-md-block d-none p-0">
                actual
              </div>
              <div className="col-xl-1 col-md-2 col-sm-3 col-4 p-0">
                compare
              </div>
            </div>
          </div>
        </div>

        {/* track */}
        {user &&
          user.addedUrls.map((track) => (
            <div
              className="track card mt-1 rounded"
              key={track._id}
              onClick={(e) => {
                handleSelectTrack(e, track);
              }}
            >
              <div className="card-body">
                <div className="row pl-1">
                  <div className="checkbox all-center">
                    <input
                      type="checkbox"
                      className="check-btn"
                      onChange={(e) => handleSelectTrack(e, track)}
                    />
                  </div>
                  <div className="col-sm-1 col-2 p-0 all-center">
                    <img
                      src={track.image}
                      alt=""
                      className="rounded"
                      style={{ height: "30px", width: "30px" }}
                    />
                  </div>
                  <div className="col-xl-5 col-lg-4 col-sm-3 col-4 p-0 d-flex align-items-center">
                    {track.name}
                  </div>
                  <div className="col-xl-1 col-md-2 col-3 p-0 d-none d-sm-flex align-items-center">
                    ₹{track.reqPrice}
                  </div>
                  <div className="col-xl-1 col-md-2 p-0 d-none d-md-flex align-items-center">
                    ₹{track.currentPrice}
                  </div>
                  <div className="col-xl-1 col-md-2 col-sm-3 col-4 p-0 d-flex align-items-center">
                    {track.currentPrice === 0 && (
                      <span className="m-0">No Price</span>
                    )}

                    {track.currentPrice !== 0 &&
                      track.reqPrice > track.currentPrice && (
                        <span className="text-success m-0">Cheap</span>
                      )}

                    {track.currentPrice !== 0 &&
                      track.reqPrice < track.currentPrice && (
                        <span className="text-danger m-0">Costly</span>
                      )}

                    {track.currentPrice === track.reqPrice && (
                      <span className="m-0 text-success">Ideal</span>
                    )}
                  </div>
                  <div
                    style={{
                      marginLeft: "10px",
                      marginRight: "10px",
                    }}
                    className="col-0 p-0 all-center justify-content-start"
                    role="button"
                  >
                    <PopupBtn type="editTrack" track={track}>
                      <small className="m-0 edit-btn btn-sm btn btn-outline-secondary d-md-inline-block d-none">
                        Edit
                      </small>
                      <small className="m-0 edit-btn btn-sm btn btn-outline-secondary d-md-none">
                        Detail
                      </small>
                    </PopupBtn>
                  </div>
                  <div
                    style={{
                      marginLeft: "6px",
                      marginRight: "14px",
                    }}
                    role="button"
                    className="col-1 p-0 all-center justify-content-center"
                  >
                    <small
                      onClick={(e) => handleVisitButton(e, track)}
                      className="btn btn-smm-0 visit-btn btn-sm btn btn-outline-secondary d-md-inline-block d-none"
                    >
                      Visit Url
                    </small>
                  </div>
                  <div className="switch all-center">
                    <input
                      id={`slider-${track._id}`}
                      type="checkbox"
                      checked={track.notification}
                    />
                    <span
                      onClick={(e) => handleSwitchType(e, track)}
                      className="slider round"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
