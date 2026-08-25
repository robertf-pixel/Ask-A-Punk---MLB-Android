# Ask A Punk Melbourne - Events App

An Instagram-style mobile app for browsing upcoming punk and DIY music events in Australia and New Zealand.

*App created by life.lair.regret. records*

## Features

- **Events Feed**: Vertical scrolling feed with beautiful event cards showing images, dates, venues, and tags
- **Save Events**: Heart icon on event cards to save your favorite events (no login required)
- **Saved Events Tab**: Dedicated tab to view all your saved events in one place
- **Search**: Filter events by title, venue, or tags
- **Clickable Hashtags**: Tap any hashtag on an event to see all events with that tag
- **Event Details**: Full event information with venue address, description, and ticket links
- **Pull to Refresh**: Stay up to date with the latest events
- **Automatic Updates**: Events sync automatically every 12 hours from Ask A Punk sites
- **Settings**: View sync status and manually trigger event refresh as well as set default location
- **Dark Punk Aesthetic**: Black background with location specific accents

## Data Source

Event data is sourced from [Ask A Punk sites](https://askapunk.au/guides), a DIY hardcore and punk events listing site powered by [Gancio](https://gancio.org/).

Events are cached in the backend database and automatically refreshed every 12 hours to ensure the app stays up to date.

## Navigation

- **Events Tab**: Main feed showing all upcoming events sorted by date
- **Saved Tab**: Your collection of favorite events (saved locally, no account needed)
- **Search Tab**: Search and filter events
- **Settings Tab**: View last sync time, event count, and manually refresh data
- **Event Modal**: Tap any event card to see full details, save/unsave, and get tickets

## Tech Stack

- Expo SDK 53 / React Native
- React Query for data fetching
- Expo Router for navigation
- NativeWind (TailwindCSS) for styling
- React Native Reanimated for animations
- Lucide React Native for icons
