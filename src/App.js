import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import Login from './routes/Login';
function App() {
  return (
    <BrowserRouter>
      <Switch>
      <Route exact path="/" component={Login} />
        <Route path="/rooms" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
