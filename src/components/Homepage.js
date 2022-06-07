import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import "./homepage.css";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


export default function Homepage() {
  const [todo, setTodo] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // read
        onValue(ref(db, `/${auth.currentUser.uid}`), (snapshot) => {
          setTodos([]);
          const data = snapshot.val();
          if (data !== null) {
            Object.values(data).map((todo) => {
              setTodos((oldArray) => [...oldArray, todo]);
            });
          }
        });
      } else if (!user) {
        navigate("/");
      }
    });
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  // add
  const writeToDatabase = () => {
    const uidd = uid();
    set(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
      todo: todo,
      uidd: uidd,
      price: price,
      amount: amount,
      currency: currency
    });

    setTodo("");
  };

  // update
  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTodo(todo.todo);
    setCurrency(todo.currency);
    setPrice(todo.price);
    setAmount(todo.amount);
    setTempUidd(todo.uidd);
  };

  const handleEditConfirm = () => {
    update(ref(db, `/${auth.currentUser.uid}/${tempUidd}`), {
      todo: todo,
      price: price,
      amount: amount,
      currency: currency
      //tempUidd: tempUidd
    });

    setTodo("");
    setIsEdit(false);
  };

  // delete
  const handleDelete = (uid) => {
    remove(ref(db, `/${auth.currentUser.uid}/${uid}`));
  };

  return (
    <div className="homepage">
      <div className="top">
        <input
          className="add-edit-input"
          type="text"
          placeholder="Add notes"
          value={todo}
          //set the value of todo when input changed
          onChange={(e) => setTodo(e.target.value)}
        />
        
        {isEdit ? (
          <div>
          <button onClick={handleEditConfirm} className="add-confirm">confirm?</button>
          </div>
        ) : (
          <div>
            <button onClick={writeToDatabase} className="add-confirm" >Add</button>
          </div>
        )}


        </div>


        <div className="bottomInput">
          <input
            className="add-edit-input"
            type="number"
            placeholder="Add price"
            value={price}
            //set the value of todo when input changed
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            className="add-edit-input"
            type="number"
            placeholder="Add amount"
            value={amount}
            //set the value of todo when input changed
            onChange={(e) => setAmount(e.target.value)}
          />

          <label for="cars">Choose a currency:</label>

          <select name="currency" id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="btc">btc</option>
            <option value="eth">eth</option>
            <option value="doge">doge</option>
            <option value="xrp">xrp</option>
          </select>

        </div>
      
        
    
      {todos.map((todo,index) => (
        //Map the saved data 
        <div key={index} className="todo">
          
          <div className="prices">
            <p>Price: {todo.price}</p>

            <p>Amount Bought: {todo.amount}</p>     
          </div>

          <p>Notes: {todo.todo}</p>
          <p>Currency: {todo.currency}</p>
          <div className="icons">
            <EditIcon
              fontSize="large"
              onClick={() => handleUpdate(todo)}
              className="edit-button"
            />
            <DeleteIcon
              fontSize="large"
              onClick={() => handleDelete(todo.uidd)}
              className="delete-button"
            />
          </div>
        </div>
      ))}

      <button onClick={handleSignOut} className="logout">sign out</button>
    </div>
  );
}