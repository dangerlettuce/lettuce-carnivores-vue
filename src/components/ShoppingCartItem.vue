<template>
  <div class="cart-item">
    <div class="cart-item-photo">
      <router-link :to="`/plants/${encodeURIComponent(item.categoryId)}/${item.sku}`">
        <img
          :src="getImageUrl(item)"
          :class="getImageUrl(item) == placeholderUrl ? 'placeholderImage' : 'cardImage'"
          :alt="`An image of ${item.name}`"
        />
      </router-link>
    </div>
    <div class="item-info">
      <div class="align-left">{{ `${item.name}` }}</div>
      <div>Size: {{ item.size }}</div>
      <div v-if="!item.isRepresentative">Specimen {{ item.sku }}</div>

      <NumberField>
        <NumberFieldContent class="quantity-input">
          <NumberFieldDecrement class="quantity-action" @click="decreaseQuantity(item)" />
          <NumberFieldInput :value="item.quantity" />
          <NumberFieldIncrement class="quantity-action" @click="increaseQuantity(item)" :disabled="item.quantity >= item.maxQuantity" />
        </NumberFieldContent>
      </NumberField>
    </div>

    <div v-if="discountedPrice === undefined" class="item-subtotal">
      <div class="text-center">{{ USDollar.format(item.price * item.quantity) }}</div>
    </div>
    <div v-else class="item-subtotal">
      <div class="text-center strikethrough">{{ USDollar.format(item.price * item.quantity) }}</div>
      <div class="text-center">{{ USDollar.format(discountedPrice * item.quantity) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '@/types/Orders';
import { getPhotoUrl, placeholderUrl } from '@/composables/usePhotoUtils';
import { USDollar } from '@/utils/utils';
import { useOrderStore } from '@/stores/order';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field';

const props = defineProps<{ item: CartItem; discountedPrice: number | undefined }>();
const emit = defineEmits(['cartItemsChanged']);
const { addItemToCart, removeItemFromCart } = useOrderStore();

async function increaseQuantity(item: CartItem) {
  await addItemToCart(item);
  emit('cartItemsChanged');
}

async function decreaseQuantity(item: CartItem) {
  if (item.quantity <= 1) {
    await deleteItem(item);
  } else {
    removeItemFromCart(item, false);
  }
  emit('cartItemsChanged');
}

async function deleteItem(item: CartItem) {
  removeItemFromCart(item, true);
  emit('cartItemsChanged');
}

function getImageUrl(cartItem: CartItem) {
  if (cartItem.photo && cartItem.photo.path) {
    return getPhotoUrl(cartItem.photo.path, 256);
  } else {
    return getPhotoUrl(null);
  }
}
</script>

<style scoped lang="scss">
.cart-item {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;

  align-items: center;

  gap: 0.5rem;
}

.cart-item-photo {
  img {
    width: 6rem;
    height: 8rem;
    object-fit: cover;
    border-radius: 0.5rem;
  }
}

.strikethrough {
  text-decoration: line-through;
  color: $medium-red;
}
.align-left {
  text-align: left;
}

.item-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 1rem;
}

.item-details {
  padding: 1rem;
  margin: 0 1rem;
}
.item-info {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.1rem;
}
.quantity-input {
  width: 7rem;
  border: 1px solid $bg-contrast;
  border-radius: 0.5rem;
}
.quantity-action:hover {
  filter: brightness(110%);
}

@media (min-width: 27rem) {
  .cart-item-photo {
    img {
      width: 10rem;
      height: 10rem;
      object-fit: cover;
    }
  }
  .item-info {
    margin: 0.5rem;
  }
  .item-subtotal {
    margin: 0.5rem 0.5rem 0 auto;
  }
}
@media (min-width: 60rem) {
  .cart-item-photo {
    img {
      width: 15rem;
      height: 15rem;
      object-fit: cover;
    }
  }
  .cart-item {
    gap: 0.75rem;
  }
  .item-info {
    gap: 0.5rem;
  }
}
</style>
