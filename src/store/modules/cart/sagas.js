import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { addToCartSuccess, updateAmountSuccess } from './actions';
import { formatPrice } from '../../../util/format';

function* addToCart({ id }) {
  console.log('id: ', id);
  const productExists = yield select((state) =>
    state.cart.find((p) => p.id === id)
  );

  console.log('productExists: ', productExists);

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  console.log('stockAmount: ', stockAmount);
  const currentAmount = productExists ? productExists.amount : 0;
  console.log('currentAmount: ', currentAmount);
  const amount = currentAmount + 1;

  console.log('amount aqui: ', amount);
  if (amount > stockAmount) {
    toast.error('Quantidade solicitada fora de estoque');
    return;
  }

  if (productExists) {
    // console.log('amount: ', amount);
    yield put(updateAmountSuccess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(addToCartSuccess(data));
  }
}

function* updateAmount({ id, amount }) {
  if (amount <= 0) return;

  const stock = yield call(api.get, `stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    toast.error('Quantidade solicitada fora de estoque');
    return;
  }

  yield put(updateAmountSuccess(id, amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
]);
