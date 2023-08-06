import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const Card = ({ user }) => {
  const [items, setItems] = useState([]);
  const [seenItems, setSeenItems] = useState(new Set());
  const [isItemListVisible, setIsItemListVisible] = useState(false);

  useEffect(() => {
    // Fetch items data for the user
    axios.get(`https://jsonplaceholder.typicode.com/todos?userId=${user.id}`)
      .then((response) => setItems(response.data));
  }, [user.id]);

  const handleItemClick = (itemId) => {
    // Mark item as seen by adding it to the set
    setSeenItems((prevSet) => new Set(prevSet).add(itemId));
  };

  const handleCardClick = () => {
    setIsItemListVisible(!isItemListVisible);
  };

  return (
    <div className="card" onClick={handleCardClick}>
      <div className="card-label">{`${user.name} (${user.id})`}</div>
      <div className="card-count">{items.length - seenItems.size}</div>
      {isItemListVisible && (
        <ItemList items={items} seenItems={seenItems} onItemClick={handleItemClick} />
      )}
    </div>
  );
};

const ItemList = ({ items, seenItems, onItemClick }) => {
  const handleItemClick = (itemId) => {
    onItemClick(itemId);
  };

  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => handleItemClick(item.id)}
          style={{ color: seenItems.has(item.id) ? 'gray' : 'black' }}
        >
          {item.title}
        </li>
      ))}
    </ul>
  );
};

const SearchBox = ({ users, seenItems, onSearchItemClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchItemClick = (userId) => {
    onSearchItemClick(userId);
  };

  const filteredUsers = users.filter((user) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            onClick={() => handleSearchItemClick(user.id)}
            style={{ color: seenItems.has(user.id) ? 'gray' : 'black' }}
          >
            {`${user.name} (${user.id})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CardList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch data from API for users
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then((response) => {
        const usersData = response.data;
        // Fetch data from API for items and add them to each user object
        Promise.all(usersData.map(user => 
          axios.get(`https://jsonplaceholder.typicode.com/todos?userId=${user.id}`)
            .then((response) => {
              user.items = response.data;
              return user;
            })
        ))
        .then(usersWithItems => setUsers(usersWithItems))
      });
  }, []);

  const handleSearchItemClick = (userId) => {
    // Mark item as seen by adding it to the set
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        user.items.forEach((item) => (item.seen = true));
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  return (
    <div>
      <SearchBox
        users={users}
        seenItems={new Set(users.flatMap((user) => user.items.filter((item) => item.seen).map((item) => item.id)))}
        onSearchItemClick={handleSearchItemClick}
      />
      <div className="container">
        {users.map((user) => (
          <Card key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <div>
      <h1>First-Level Cards</h1>
      <CardList />
    </div>
  );
}

export default App;
