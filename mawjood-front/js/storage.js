/*
 * Mawjood local storage helpers
 * -----------------------------
 * Stores non-sensitive user preferences and convenience lists in this browser.
 * This is front-end-only storage: data stays on the current browser/device and
 * is not synced to a server. Do not store passwords, medical records, or other
 * sensitive information here.
 *
 * Public API: window.MawjoodStorage
 *   .get(key, fallback)
 *   .set(key, value)
 *   .remove(key)
 *   .clearAll()
 *   .getPreferences() / .savePreferences(patch)
 *   .getRecentSearches() / .addRecentSearch(query) / .clearRecentSearches()
 *   .getSavedSearches() / .saveSearch(search) / .removeSavedSearch(id)
 *   .getFavorites(type) / .toggleFavorite(type, id) / .isFavorite(type, id)
 */
(function (window) {
  "use strict";

  var PREFIX = "mawjood:";
  var KEYS = {
    preferences: PREFIX + "preferences",
    recentSearches: PREFIX + "recent-searches",
    savedSearches: PREFIX + "saved-searches",
    favoriteMedicines: PREFIX + "favorite-medicines",
    favoritePharmacies: PREFIX + "favorite-pharmacies",
  };
  var memoryFallback = Object.create(null);

  // Read a JSON value safely. If browser storage is blocked, use in-memory data.
  function read(key, fallback) {
    var raw;
    try {
      raw = window.localStorage.getItem(key);
    } catch (error) {
      raw = Object.prototype.hasOwnProperty.call(memoryFallback, key)
        ? memoryFallback[key]
        : null;
    }

    if (raw === null || raw === undefined) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  // Write a JSON value safely. The memory fallback lasts only until this page closes.
  function write(key, value) {
    var serialized;
    try {
      serialized = JSON.stringify(value);
    } catch (error) {
      return false;
    }

    try {
      window.localStorage.setItem(key, serialized);
      delete memoryFallback[key];
      return true;
    } catch (error) {
      memoryFallback[key] = serialized;
      return false;
    }
  }

  function makeId() {
    return (
      "saved-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function normaliseFavoriteType(type) {
    if (type === "medicine" || type === "medicines") return "medicine";
    if (type === "pharmacy" || type === "pharmacies") return "pharmacy";
    return null;
  }

  function getFavoriteKey(type) {
    var normalised = normaliseFavoriteType(type);
    if (normalised === "medicine") return KEYS.favoriteMedicines;
    if (normalised === "pharmacy") return KEYS.favoritePharmacies;
    return null;
  }

  var api = {
    // Generic helpers use keys scoped to Mawjood to avoid collisions with other apps.
    get: function (key, fallback) {
      if (typeof key !== "string" || !key) return fallback;
      return read(PREFIX + key, fallback === undefined ? null : fallback);
    },

    set: function (key, value) {
      if (typeof key !== "string" || !key) return false;
      return write(PREFIX + key, value);
    },

    remove: function (key) {
      if (typeof key !== "string" || !key) return;
      try {
        window.localStorage.removeItem(PREFIX + key);
      } catch (error) {}
      delete memoryFallback[PREFIX + key];
    },

    // Remove only Mawjood-owned keys, not the site's language preference or other apps' data.
    clearAll: function () {
      Object.keys(KEYS).forEach(function (name) {
        var key = KEYS[name];
        try {
          window.localStorage.removeItem(key);
        } catch (error) {}
        delete memoryFallback[key];
      });
    },

    getPreferences: function () {
      var value = read(KEYS.preferences, {});
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    },

    savePreferences: function (patch) {
      if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
        return api.getPreferences();
      }
      var current = api.getPreferences();
      Object.keys(patch).forEach(function (key) {
        current[key] = patch[key];
      });
      write(KEYS.preferences, current);
      return current;
    },

    getRecentSearches: function () {
      var value = read(KEYS.recentSearches, []);
      return Array.isArray(value) ? value : [];
    },

    addRecentSearch: function (query) {
      var cleanQuery = String(query == null ? "" : query).trim();
      if (!cleanQuery) return api.getRecentSearches();
      var searches = api.getRecentSearches().filter(function (item) {
        return (
          String(item.query || "").toLocaleLowerCase() !==
          cleanQuery.toLocaleLowerCase()
        );
      });
      searches.unshift({
        query: cleanQuery,
        searchedAt: new Date().toISOString(),
      });
      searches = searches.slice(0, 10);
      write(KEYS.recentSearches, searches);
      return searches;
    },

    clearRecentSearches: function () {
      write(KEYS.recentSearches, []);
    },

    getSavedSearches: function () {
      var value = read(KEYS.savedSearches, []);
      return Array.isArray(value) ? value : [];
    },

    // Save a query and optional filter settings for later use.
    saveSearch: function (search) {
      if (!search || typeof search !== "object") return null;
      var query = String(search.query == null ? "" : search.query).trim();
      var filters =
        search.filters && typeof search.filters === "object"
          ? search.filters
          : {};
      if (!query && Object.keys(filters).length === 0) return null;

      var saved = api.getSavedSearches();
      var item = {
        id: search.id || makeId(),
        name: String(search.name || query || "Saved search").trim(),
        query: query,
        filters: filters,
        savedAt: new Date().toISOString(),
      };
      var existingIndex = saved.findIndex(function (entry) {
        return entry.id === item.id;
      });
      if (existingIndex >= 0) saved[existingIndex] = item;
      else saved.unshift(item);
      write(KEYS.savedSearches, saved.slice(0, 20));
      return item;
    },

    removeSavedSearch: function (id) {
      var updated = api.getSavedSearches().filter(function (item) {
        return item.id !== id;
      });
      write(KEYS.savedSearches, updated);
      return updated;
    },

    getFavorites: function (type) {
      var key = getFavoriteKey(type);
      if (!key) return [];
      var value = read(key, []);
      return Array.isArray(value) ? value : [];
    },

    isFavorite: function (type, id) {
      if (id === null || id === undefined || id === "") return false;
      return api.getFavorites(type).indexOf(String(id)) !== -1;
    },

    // Adds an ID if it is not saved; otherwise removes it. Returns the new saved state.
    toggleFavorite: function (type, id) {
      var key = getFavoriteKey(type);
      if (!key || id === null || id === undefined || id === "") return false;
      var idString = String(id);
      var favorites = api.getFavorites(type);
      var index = favorites.indexOf(idString);
      var isNowFavorite;
      if (index === -1) {
        favorites.unshift(idString);
        isNowFavorite = true;
      } else {
        favorites.splice(index, 1);
        isNowFavorite = false;
      }
      write(key, favorites);
      return isNowFavorite;
    },
  };

  window.MawjoodStorage = api;
})(window);
