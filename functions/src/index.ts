import admin from 'firebase-admin'
admin.initializeApp()
import stripeCheckoutController from './stripeCheckoutController'
import stripeWebhookController from './stripeWebhookController'
import giveawayService from './giveawayService'
import {
    getEbayAccessToken,
    getUserConsent,
    getUserAccessToken,
    refreshUserAccessToken,
    getInventory,
    postInventoryItem,
    createEbayOffer,
    deleteEbayInventory,
    ebayNotificationController
} from './ebay/ebayController'

import {
    sendOrderStatusEmail
} from './email/emailController'

exports.stripeCheckoutController = stripeCheckoutController;
exports.stripeWebhookController = stripeWebhookController;
exports.giveawayService = giveawayService;
exports.getEbayAccessToken = getEbayAccessToken;
exports.getUserConsent = getUserConsent;
exports.getUserAccessToken = getUserAccessToken;
exports.refreshUserAccessToken = refreshUserAccessToken;
exports.getInventory = getInventory;
exports.postInventoryItem = postInventoryItem;
exports.createEbayOffer = createEbayOffer;
exports.deleteEbayInventory = deleteEbayInventory;
exports.ebayNotificationController = ebayNotificationController;
exports.sendOrderStatusEmail =  sendOrderStatusEmail;
