"use server";

/**
 * Reexport de acciones usadas por páginas que solo necesitan comprobar acceso o nombre de campaña.
 * @module app/actions/campaign
 */
export {
  assertCampaignAccess,
  getCampaignNameIfAllowed,
} from "@/app/actions/campaign-manager";
