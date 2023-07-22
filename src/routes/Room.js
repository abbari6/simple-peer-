import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

const Video = (props) => {
  console.log("🚀 ~ file: Room.js:21 ~ Video ~ props:", props)
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  const hideCamera=()=>{
    const payload = {userToHide: props.socketId};
    props.socket.current.emit('hide user', payload)
  }

  const muteAudio=()=>{
    const payload = {useToMute: props.socketId};
    props.socket.current.emit('mute audio', payload)
  }

  return (
    <div style={{display:'flex', flexDirection:"column"}}>
      <StyledVideo playsInline autoPlay ref={ref} />
      <div style={{ display: "flex" }}>
        <button style={{ width: "50px" }} onClick={hideCamera}>
          Mute video
        </button>
        <button style={{ width: "50px" }} onClick={muteAudio}>
          Mute audio
        </button>
      </div>
    </div>
  );
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomId = props.match.params.roomID;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userID");
  const username = localStorage.getItem("username");
  useEffect(() => {
    socketRef.current = io.connect(
      `ws://localhost:3001/scenario?scenarioId=abc`,
      {
        transports: ["websocket"],
        withCredentials: true,
        auth: { token },
      }
    );
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        const payload = { roomId: roomId, userId, username };
        socketRef.current.emit("join room", payload);
        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((user) => {
            const peer = createPeer(
              user.socketId,
              socketRef.current.id,
              stream
            );
            peersRef.current.push({
              peerID: user.socketId,
              peer,
            });
            peers.push({ socketId: user.socketId, peer: peer });
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          console.log(payload, "user joined");
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [
            ...users,
            { socketId: payload.calledID, peer: peer },
          ]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function toggleCamera() {
    const videoTrack = userVideo.current.srcObject
      .getTracks()
      .find((track) => track.kind === "video"); //array of tracks , if audio and video
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
    } else {
      videoTrack.enabled = true;
    }
  }

  function muteAudio() {
    const audioTrack = userVideo.current.srcObject
      .getTracks()
      .find((track) => track.kind === "audio"); //array of tracks , if audio and video
    if (audioTrack.enabled) {
      audioTrack.enabled = false;
    } else {
      audioTrack.enabled = true;
    }
  }
  useEffect( ()=>{
    socketRef.current.on('hide me',()=>{
        toggleCamera();
    })
  },[])

  useEffect( ()=>{
    socketRef.current.on('mute my audio',()=>{
        muteAudio();
    })
  },[])

  return (
    <Container>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
        <div style={{ display: "flex" }}>
          <button style={{ width: "50px" }} onClick={toggleCamera}>
            Mute video
          </button>
          <button style={{ width: "50px" }} onClick={muteAudio}>
            Mute audio
          </button>
        </div>
      </div>
      {peers.map((peers) => {
        return <Video socket={socketRef} key={peers.socketId} peer={peers.peer} socketId={peers.socketId} />;
      })}
    </Container>
  );
};

export default Room;
