import {
  KLAVIYO_COMPANY_ID,
  KLAVIYO_NEWSLETTER_LIST_ID,
} from '../analytics/third-party';

/**
 * Klaviyo API revision this request body was written against.
 * https://developers.klaviyo.com/en/reference/create_client_subscription
 */
const KLAVIYO_REVISION = '2026-10-15';

const GENERIC_ERROR = 'We could not sign you up just now. Please try again.';

/**
 * Subscribe an email address to the Newsletter list in Klaviyo.
 *
 * Uses Klaviyo's client-side endpoint, which is designed to be called from the
 * browser with the public site ID only. No private key is involved.
 * Resolves on success (HTTP 202) and throws an Error with a user-facing
 * message otherwise.
 */
export async function subscribeToNewsletter(
  email: string,
  source = 'Website signup form',
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(
      `https://a.klaviyo.com/client/subscriptions?company_id=${KLAVIYO_COMPANY_ID}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/vnd.api+json',
          revision: KLAVIYO_REVISION,
        },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: source,
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email,
                    subscriptions: {
                      email: { marketing: { consent: 'SUBSCRIBED' } },
                    },
                  },
                },
              },
            },
            relationships: {
              list: {
                data: { type: 'list', id: KLAVIYO_NEWSLETTER_LIST_ID },
              },
            },
          },
        }),
      },
    );
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (!response.ok) {
    throw new Error(GENERIC_ERROR);
  }
}
