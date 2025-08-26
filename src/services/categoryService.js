const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const CategoryBook = require('../models/categoryBookModel');
const Book = require('../models/bookModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Create a new category and associate books with it.
 * @param {Object} categoryData - Data for the new category (name, tags, genres).
 * @param {string[]} bookIds - An array of book IDs to associate with this category.
 * @param {string} createdBy - The ID of the user who created the category.
 * @returns {Object} The newly created category.
 */
const createCategory = async (categoryData, bookIds = [], createdBy) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        if (bookIds && bookIds.length > 0) {
            const existingBooksCount = await Book.countDocuments({ _id: { $in: bookIds } }).session(session);
            if (existingBooksCount !== bookIds.length) {
                throw new ApiError(400, 'One or more provided book IDs are invalid.');
            }
        }

        const lastCategory = await Category.findOne({}).sort({ order: -1 }).session(session);
        const nextOrder = lastCategory ? lastCategory.order + 1 : 1;

        const category = new Category({ ...categoryData, order: nextOrder, createdBy });
        await category.save({ session });

        if (bookIds && bookIds.length > 0) {
            const categoryBookEntries = bookIds.map((bookId, index) => ({
                category: category._id,
                book: bookId,
                order: index + 1
            }));
            await CategoryBook.insertMany(categoryBookEntries, { session });
        }

        await session.commitTransaction();
        logger.info(`New category created successfully: ${category.name}`);
        return category;

    } catch (error) {
        await session.abortTransaction();
        logger.error('Category creation failed, transaction aborted:', error.message);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Get all categories with pagination and sorting.
 * @param {Object} options - Query options for pagination, sorting, etc.
 * @returns {Object} A list of categories and pagination details.
 */
const getAllCategories = async (options = {}) => {
    const { page = 1, limit = 10, sort = 'order', order = 'asc', search = '' } = options;

    try {
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const categories = await Category.find(query)
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('tags', 'name')
            .populate('genres', 'title');

        const total = await Category.countDocuments(query);
        const totalPages = Math.ceil(total / limit);


        return {
            results: categories,
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };
    } catch (error) {
        logger.error('Error fetching categories:', error.message);
        throw error;
    }
};

/**
 * Get a single category by its ID, including its ordered list of books.
 * @param {string} id - The ID of the category.
 * @returns {Object} The category object with populated books.
 */
const getCategoryById = async (id) => {
    try {
        const category = await Category.findById(id)
            .populate('tags', 'name')
            .populate('genres', 'title')
            .lean();

        if (!category) {
            throw new ApiError(404, 'Category not found.');
        }

        const categoryBooks = await CategoryBook.find({ category: category._id })
            .sort({ order: 'asc' })
            .populate({
                path: 'book',
                select: 'title bookCover'
            });

        category.books = categoryBooks.map(cb => ({
            book: cb.book,
            order: cb.order
        })).filter(item => item.book);

        return category;
    } catch (error) {
        logger.error(`Error fetching category with id ${id}:`, error.message);
        throw error;
    }
};

/**
 * Update an existing category's name.
 * @param {string} id - The ID of the category to update.
 * @param {Object} updateData - The data to update, containing only the 'name'.
 * @returns {Object} The updated category.
 */
const updateCategory = async (id, updateData) => {
    const { name } = updateData;

    try {
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, 'Category not found.');
        }

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory && existingCategory._id.toString() !== id) {
                throw new ApiError(400, 'A category with this name already exists.');
            }
            category.name = name;
            await category.save();
        }

        logger.info(`Category updated successfully: ${category.name}`);
        return getCategoryById(id);
    } catch (error) {
        logger.error(`Category update for id ${id} failed:`, error.message);
        throw error;
    }
};

/**
 * Permanently delete a category and its book associations.
 * @param {string} id - The ID of the category to delete.
 */
const deleteCategory = async (id) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const category = await Category.findById(id).session(session);
        if (!category) {
            throw new ApiError(404, 'Category not found.');
        }

        await CategoryBook.deleteMany({ category: category._id }).session(session);
        await Category.deleteOne({ _id: category._id }).session(session);

        await session.commitTransaction();
        logger.info(`Category with id '${id}' deleted permanently.`);
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to delete category with id '${id}':`, error.message);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Reorder all categories based on a provided list of IDs.
 * @param {string[]} orderedCategoryIds - An array of category IDs in the desired new order.
 */
const reorderCategories = async (orderedCategoryIds) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bulkOps = orderedCategoryIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index + 1 } }
            }
        }));

        if (bulkOps.length === 0) {
            await session.commitTransaction();
            return;
        }

        const result = await Category.bulkWrite(bulkOps, { session });

        if (result.matchedCount !== orderedCategoryIds.length) {
            throw new ApiError(400, 'One or more category IDs are invalid or could not be found.');
        }

        await session.commitTransaction();
        logger.info(`Successfully reordered ${result.matchedCount} categories.`);
        return result.matchedCount;
    } catch (error) {
        await session.abortTransaction();
        logger.error('Failed to reorder categories:', error.message);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Add one or more books to an existing category.
 * @param {string} id - The ID of the category.
 * @param {string[]} bookIds - An array of book IDs to add.
 */
const addBooksToCategory = async (id, bookIds) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const category = await Category.findById(id).session(session);
        if (!category) {
            throw new ApiError(404, 'Category not found.');
        }

        const existingBooksCount = await Book.countDocuments({ _id: { $in: bookIds } }).session(session);
        if (existingBooksCount !== bookIds.length) {
            throw new ApiError(400, 'One or more provided book IDs are invalid.');
        }

        const existingAssociations = await CategoryBook.find({ category: category._id, book: { $in: bookIds } }).session(session);
        const existingBookIds = new Set(existingAssociations.map(assoc => assoc.book.toString()));
        const newBookIds = bookIds.filter(id => !existingBookIds.has(id));

        if (newBookIds.length === 0) {
            throw new ApiError(400, 'All books are already in the category.');
        }

        const lastBook = await CategoryBook.findOne({ category: category._id }).sort({ order: -1 }).session(session);
        const startOrder = lastBook ? lastBook.order + 1 : 1;

        const categoryBookEntries = newBookIds.map((bookId, index) => ({
            category: category._id,
            book: bookId,
            order: startOrder + index
        }));

        await CategoryBook.insertMany(categoryBookEntries, { session });

        await session.commitTransaction();
        logger.info(`Added ${newBookIds.length} books to category '${category.name}'.`);
        return getCategoryById(id);
    } catch (error) {
        await session.abortTransaction();
        logger.error(`Failed to add books to category`, error.message);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Remove one or more books from a category.
 * @param {string} id - The ID of the category.
 * @param {string[]} bookIds - An array of book IDs to remove.
 */
const removeBooksFromCategory = async (id, bookIds) => {
    try {
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, 'Category not found.');
        }

        const result = await CategoryBook.deleteMany({
            category: category._id,
            book: { $in: bookIds }
        });

        if (result.deletedCount > 0) {
            logger.info(`Removed ${result.deletedCount} books from category '${category.name}'.`);
        }

        return getCategoryById(id);
    } catch (error) {
        logger.error(`Failed to remove books from category :`, error.message);
        throw error;
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addBooksToCategory,
    removeBooksFromCategory
};
