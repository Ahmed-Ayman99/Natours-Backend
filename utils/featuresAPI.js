class featuresAPI {
  execludedFields = ["page", "limit", "sort", "fields"];

  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = JSON.parse(
      JSON.stringify(queryStr).replace(/\b(gt|gte|lt|lte)\b/g, (m) => `$${m}`)
    );
  }

  filter() {
    const queryStr = JSON.parse(JSON.stringify(this.queryStr));
    this.execludedFields.forEach((item) => delete queryStr[item]);
    this.query.find(queryStr);

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortQueries = this.queryStr.sort.split(",").join(" ");
      this.query.sort(sortQueries);
    }

    return this;
  }

  limitation() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    if (!this.queryStr.fields) {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = featuresAPI;
