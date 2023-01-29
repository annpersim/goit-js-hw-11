import PixabayApi from './fetchPixabay';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  input: document.querySelector('input'),
  submitBtn: document.querySelector('button'),
  galleryDiv: document.querySelector('.gallery'),
};

const newPixabayApi = new PixabayApi();
var lightbox = new SimpleLightbox('.gallery a', {
  captions: false,
});

refs.searchForm.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  clearGallery();
  newPixabayApi.resetPage();

  newPixabayApi.searchQuery = e.target.searchQuery.value.trim();
  if (!newPixabayApi.searchQuery) {
    return;
  }

  const image = await newPixabayApi.fetchPixabay();

  const images = image.hits;
  addImageToGallery(images);

  const totalHits = image.totalHits;

  if (totalHits === 0) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notiflix.Notify.success('Hooray! We found ' + `${totalHits}` + ' images.');
  }
}

function addImageToGallery(images) {
  refs.galleryDiv.insertAdjacentHTML(
    'beforeend',
    images
      .map(
        ({
          largeImageURL,
          webformatURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) =>
          `<div class="photo-card">
            <div class="photo-image">
              <a href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              </a>
            </div>
            <div class="info">
              <div class="info-item"><b>Likes</b><p>${likes}</p></div>
              <div class="info-item"><b>Views</b><p>${views}</p></div>
              <div class="info-item"><b>Comments</b><p>${comments}</p></div>
              <div class="info-item"><b>Downloads</b><p>${downloads}</p></div>
            </div>
          </div>`
      )
      .join('')
  );
  lightbox.refresh();
}

function clearGallery() {
  refs.galleryDiv.innerHTML = '';
}

//Infinite scroll

(() => {
  window.addEventListener('scroll', throttle(checkPosition, 300));
  window.addEventListener('resize', throttle(checkPosition, 300));
})();

async function checkPosition() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;
  const scrolled = window.scrollY;
  const threshold = height - screenHeight / 4;
  const position = scrolled + screenHeight;

  if (position >= threshold) {
    const image = await newPixabayApi.fetchPixabay();
    const images = image.hits;
    addImageToGallery(images);

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

function throttle(callee, timeout) {
  let timer = null;

  return function perform(...args) {
    if (timer) return;

    timer = setTimeout(() => {
      callee(...args);

      clearTimeout(timer);
      timer = null;
    }, timeout);
  };
}
