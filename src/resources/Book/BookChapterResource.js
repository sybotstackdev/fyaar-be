const BookChapterResource = require('./BookChapterResource');

class BookResource {
    static transform(book) {
        // Ensure populated fields are handled gracefully if they are not present
        const transformIfPopulated = (data, resource) => {
            if (!data) return [];
            // Check if the first element is populated (not just an ObjectId)
            if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
                return data.map(item => resource.transform(item));
            }
            return data; // Return IDs if not populated
        };

        const transformSingleIfPopulated = (data, resource) => {
            if (data && typeof data === 'object' && data !== null) {
                return resource.transform(data);
            }
            return data;
        };

        return {
            id: book._id,
            title: book.title,
            slug: book.slug,
            description: book.description,
            bookCover: book.bookCover,
            status: book.status,
            authors: book.authors ? book.authors.map(author => ({
                id: author._id,
                name: author.authorName,
                penName: author.penName
            })) : [],
            tags: book.tags ? book.tags.map(tag => ({ id: tag._id, name: tag.name })) : [],
            genres: book.genres ? book.genres.map(genre => ({ id: genre._id, title: genre.title })) : [],
            plots: book.plots ? book.plots.map(plot => ({ id: plot._id, title: plot.title })) : [],
            narrative: book.narrative ? { id: book.narrative._id, label: book.narrative.optionLabel } : null,
            endings: book.endings ? book.endings.map(ending => ({ id: ending._id, label: ending.optionLabel })) : [],
            spiceMoods: book.spiceMoods ? book.spiceMoods.map(mood => ({ id: mood._id, name: mood.comboName, intensity: mood.intensity })) : [],
            locations: book.locations ? book.locations.map(location => ({ id: location._id, name: location.name, country: location.country })) : [],
            chapterCount: book.chapterCount, // From virtual field
            createdAt: book.createdAt.toISOString(),
            updatedAt: book.updatedAt.toISOString()
        };
    }

    static transformCollection(books) {
        return books.map(book => BookResource.transform(book));
    }
}

module.exports = BookResource;
