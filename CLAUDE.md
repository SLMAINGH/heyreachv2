# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is HeyReach V2 - a single-page conversation dashboard application for managing LinkedIn outreach campaigns. The application should be structured as separate HTML and JavaScript/TypeScript files with no CSS styling.

## Architecture

**File structure**: 
- `index.html` - Pure HTML structure without embedded styles or scripts
- JavaScript/TypeScript files for application logic
- No CSS files - unstyled HTML only

**Key components**:
- State management via a global `state` object containing API configurations, data, and filters  
- API layer using a custom `apiCall` helper function that communicates with a Cloudflare Worker endpoint
- Optimized data fetching using parallel Promise.all() calls to avoid N+1 query problems
- Client-side filtering and statistics calculation
- CSV export functionality with proper escaping

**Data flow**:
1. User configures authentication and selects API keys
2. Parallel API calls fetch accounts, campaigns, and conversations for each key  
3. Additional parallel calls fetch detailed chatroom data for all conversations
4. Data is processed, filtered, and displayed in a table with statistics

## Development

**No build commands**: Static HTML file with separate JS/TS files that can be opened directly in a browser or served via any HTTP server.

**Testing**: Open `index.html` in a browser and test functionality with valid API credentials.

**Key optimization patterns**:
- Parallel API calls using Promise.all() and Promise.allSettled()
- DocumentFragment for efficient DOM updates  
- Maps for O(1) lookup performance in data processing
- Event delegation for dynamically created elements

**API Integration**: 
- Communicates with Cloudflare Worker at `https://snowy-hall-5f3d.lammelstanislaw.workers.dev`
- Uses custom authentication via `X-Custom-Auth` header
- Supports multiple API keys via `X-API-KEY` header
- Handles pagination for large datasets

**UI Language**: Interface is in Polish (pl)