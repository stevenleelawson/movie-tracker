import React, { Component } from 'react';
import { NavLink, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CardContainer from '../CardContainer';
import FormContainer from '../FormContainer';
import * as actions from '../../actions';
import * as api from '../../apiCalls/';
import './styles.css';

export class App extends Component {

  componentDidMount = async () => {
    this.fetchRecentMovies();
    const lastUser = JSON.parse(localStorage.getItem('Last User'));
    if (lastUser) {
      this.props.captureUser(lastUser);
      const userFavs = await api.getUserFavorites(lastUser.id);
      this.props.loadFavorites(userFavs);
      this.props.changeLogStatus(true);
    }
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.user !== this.props.user && this.props.user) {
      this.fetchLoggedInUserData();
    }
  }

  fetchRecentMovies = async () => {
    const movies = await api.getMovies();
    this.props.loadCards(movies);
  }

  fetchLoggedInUserData = async () => {
    const userFavs = await api.getUserFavorites(this.props.user.id);
    this.props.loadFavorites(userFavs);
    localStorage.setItem('Last User', JSON.stringify(this.props.user));
  }

  logOut = () => {
    this.props.changeLogStatus(false);
    this.props.logOutUser();
    this.props.loadFavorites([]);
    localStorage.clear();
  }

  render = () => {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">MOVIE TRACKER</h1>
          <nav className='nav-bar'>
            <NavLink exact to='/'>Home</NavLink>
            {
              this.props.user ? (
                <div>
                  <NavLink to='/favorites'>Favorites</NavLink>
                  <button className='logout' onClick={() => this.logOut()}>
                    Log Out
                  </button>
                </div>
              ) : (
                <div>
                  <NavLink to='/forms/signup'>Sign Up</NavLink>
                  <NavLink to='/forms/login'>Log In</NavLink>
                </div>
              )
            }
          </nav>
        </header>
        <Switch>
          <Route exact path='/' render={({ match }) =>
            <CardContainer match={match} /> } />
          <Route path='/forms/:id' render={({ match }) =>
            <FormContainer match={match} /> } />
          <Route exact path='/favorites' render={({ match }) =>
            <CardContainer match={match} /> } />
        </Switch>
      </div>
    );
  }
}

export const mapStateToProps = state => ({
  user: state.user
});

export const mapDispatchToProps = dispatch => ({
  loadFavorites: favorites => dispatch(actions.loadFavorites(favorites)),
  loadCards: movies => dispatch(actions.loadCards(movies)),
  captureUser: user => dispatch(actions.captureUser(user)),
  logOutUser: () => dispatch(actions.logOutUser()),
  changeLogStatus: boolean => dispatch(actions.changeLogStatus(boolean))
});

App.propTypes = {
  loadCards: PropTypes.func.isRequired,
  captureUser: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    id: PropTypes.number
  }),
  logOutUser: PropTypes.func.isRequired,
  changeLogStatus: PropTypes.func.isRequired,
  loadFavorites: PropTypes.func.isRequired
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
