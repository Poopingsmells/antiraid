const { Collection } = require("discord.js");
const { Model } = require("mongoose");

// { '123': { modlogs: 123 }, '567': {modlogs: 567}}
class CacheManagerById {
  constructor(model) {
    this.model = model;

    this.cache = new Collection();

    try {
      if (!(model instanceof Model))
        throw new Error("An incorrect model was passed");
      this.syncCache();
    } catch (error) {
      console.error(error);
    }
  }

  async create(data) {
    const result = new this.model(data);
    await result.save();
    this.cache.set(data.guildID, data);
    return result;
  }

  get(id) {
    return this.cache.get(id);
  }

  async fetch(id) {
    const data = await this.model.findOne(id);
    this.cache.set(id, data);
    return data;
  }

  async update(id, ...options) {
    const data = await this.model.findOneAndUpdate(id, ...options);
    this.cache.set(id, data);
    return data;
  }

  async remove(id) {
    await this.model.findOneAndRemove(id);
    return this.cache.delete(id);
  }

  async syncCache() {
    const data = await this.model.find({});
    this.cache.clear();
    for (const dataObject of data) {
      this.cache.set(dataObject.guildID, dataObject);
    }
  }
}

// [{guild: 123, user: 123, muted: false}, {guild: 123, user: 123, muted: true}]
class CacheManager {
  constructor(model) {
    this.model = model;

    this.cache = new Set();

    try {
      if (!(model instanceof Model))
        throw new Error("An incorrect model was passed");
      this.syncCache();
    } catch (error) {
      console.error(error);
    }
  }

  async syncCache() {
    const data = await this.model.find({});
    this.cache.clear();
    for (const dataInstance of data) {
      this.cache.add(dataInstance);
    }
  }
}

module.exports = {
  CacheManagerById,
  CacheManager,
};
