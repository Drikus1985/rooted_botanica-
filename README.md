# Rooted Botanica 🌱

Online shop for Mila's carnivorous plants: Venus flytraps, Sarracenia, Nepenthes, sundews and printed care cards.

It's a plain HTML/CSS/JavaScript site with no build step, no database and no monthly fee. It can be hosted free on GitHub Pages.

## What it does

| Feature | Where the idea came from |
|---|---|
| Shop grid with large photos, size picker and stock badges | Cultivo Carnivores (shop format, image layout) |
| Clean, simple layout and a **New arrivals** section | Curry's Post Carnivores |
| **Care cards** sold on their own *and* included with plant purchases | Jozi Carnivores |
| Search bar with **Popular searches** chips | Bonsai Tree |
| Socials in the footer | Mila's note |

How the cart and checkout work: customers add plants to a cart, which is saved in their browser. They fill in their details and tap **Send on WhatsApp** or **Send by email**, which sends a pre-written order. You confirm stock, send payment details, and post the plant. If you add a payment link, a **Pay now** button also appears.

## Before going live: checklist

1. **Set real prices** in `assets/js/products.js`. The current prices are placeholders.
2. **Check the photos.** I guessed which Sarracenia photo goes with which plant (`sarracenia-1/2/3.jpg`). Fix any that are wrong. The Venus flytrap, sundew and 'Fiona' have drawings until real photos are added.
3. Fill in `assets/js/config.js`: WhatsApp number, order email, socials, delivery prices. **Use parent-managed contact details.**
4. *(Optional)* Have a parent open a Yoco / PayFast / SnapScan account and paste its payment link into `paymentLink`.
5. Make the care cards themselves (Canva works well for this).

## Day-to-day updates

All the shop information is in two files:

- `assets/js/products.js`: plants, sizes, prices, stock, photos, "new" flag, care cards
- `assets/js/config.js`: contact details, socials, delivery options, care card rules

When you sell something, lower its `stock` number. At `0` the size shows "Sold out" and can't be bought.

The stock count isn't automatic. The website doesn't know about a sale until you update `stock`. Do this after every order so two people can't buy the last plant.

## Publish for free (GitHub Pages)

Repo **Settings → Pages → Source: Deploy from a branch → `main` / root**. The site will appear at `https://<username>.github.io/rooted_botanica-/`. You can connect a custom `.co.za` domain later.

## Preview on your computer

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
