// src/components/Rooms.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";


const CreateRoom = (props) => {
    const [rooms, setRooms] = useState([]);
    const history = useHistory();
    const host = "http://localhost:3001";

    useEffect(() => {
      // Fetch rooms from the API
      axios
        .get(`${host}/api/scenarios`)
        .then((response) => {
          setRooms(response.data);
        })
        .catch((error) => {
          console.error("Error fetching rooms:", error);
        });
    }, []);
    const handleJoinRoom = (roomId) => {
        const token = localStorage.getItem("token");
        history.push(`/room/${roomId}`);    
        if (!token) {
          console.error("Token not found");
          return;
        }
      };
    return (
        <div>
      <h2>Rooms</h2>
      <ul>
      {rooms.map((scenario, index) => (
          <li key={index} className="chat-room-item">
            <span>{scenario.name}</span>
            <button
              className="join-button"
              onClick={() => handleJoinRoom(scenario.id)}
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
    );
};

export default CreateRoom;
