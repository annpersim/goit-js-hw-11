import axios from 'axios';
import Notiflix from 'notiflix';

const URL = 'https://pixabay.com/api/';
const API_KEY = '33152834-eeaeeae4e604e04dc4cc38ec8';

export default class PixabayApi {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchPixabay() {
    const options = {
      key: `${API_KEY}`,
      q: `${this.searchQuery}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: `${this.page}`,
    };

    const response = await axios.get(URL, { params: options });

    if (response.data.totalHits < options.per_page * `${this.page}`) {
      return Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      this.incrementPage();
      return response.data;
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}
