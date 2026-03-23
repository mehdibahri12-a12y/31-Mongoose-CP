// Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define the Person Schema
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        min: 0,
        default: null
    },
    favoriteFoods: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Create the Person model
const Person = mongoose.model('Person', personSchema);

// Connect to MongoDB - SIMPLIFIED FOR MONGOOSE v7+
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
        // Run the exercises after successful connection
        runExercises();
    })
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error.message);
    });

/**
 * Create and Save a Record of a Model
 * Creates a new person and saves it to the database
 */
const createAndSavePerson = async () => {
    // Create a new person instance
    const person = new Person({
        name: 'John Doe',
        age: 25,
        favoriteFoods: ['pizza', 'pasta', 'ice cream']
    });

    // Save the person to the database
    return person.save();
};

/**
 * Create Many Records with model.create()
 * Creates multiple people at once
 */
const createManyPeople = async () => {
    const arrayOfPeople = [
        { name: 'Alice Johnson', age: 28, favoriteFoods: ['sushi', 'ramen'] },
        { name: 'Bob Smith', age: 32, favoriteFoods: ['burger', 'fries'] },
        { name: 'Mary Wilson', age: 24, favoriteFoods: ['salad', 'burrito'] },
        { name: 'Mary Brown', age: 29, favoriteFoods: ['burrito', 'tacos'] }
    ];

    return Person.create(arrayOfPeople);
};


/**
 * Use model.find() to Search Your Database
 * Find all people with a given name
 */
const findPeopleByName = async (personName) => {
  // Use regex to find names that contain the search string
  return Person.find({ name: { $regex: personName, $options: 'i' } });
  // The 'i' option makes it case-insensitive
};

/**
 * Use model.findOne() to Return a Single Matching Document
 * Find one person who has a specific food in their favorites
 */
const findOneByFood = async (food) => {
    return Person.findOne({ favoriteFoods: food });
};

/**
 * Use model.findById() to Search Your Database By _id
 * Find a person by their ID
 */
const findPersonById = async (personId) => {
    return Person.findById(personId);
};

/**
 * Perform Classic Updates by Running Find, Edit, then Save
 * Find a person by ID, add "hamburger" to their favoriteFoods, and save
 */
const addFavoriteFood = async (personId) => {
    // Find the person by ID
    const person = await Person.findById(personId);

    if (!person) {
        throw new Error('Person not found');
    }

    // Add hamburger to favorite foods
    person.favoriteFoods.push('hamburger');

    // Since favoriteFoods is an array of strings (not Mixed type), 
    // we don't need to use markModified()
    // Save the updated person
    return person.save();
};

/**
 * Perform New Updates on a Document Using model.findOneAndUpdate()
 * Find a person by name and set their age to 20
 */
const updatePersonAge = async (personName) => {
    return Person.findOneAndUpdate(
        { name: personName },
        { age: 20 },
        { returnDocument: 'after' } // This replaces { new: true }
    );
};

/**
 * Delete One Document Using model.findByIdAndRemove
 * Delete a person by their ID
 */
const deletePersonById = async (personId) => {
    return Person.findByIdAndDelete(personId);
};

/**
 * Delete Many Documents with model.remove()
 * Delete all people named "Mary"
 */
const deleteManyMary = async () => {
    return Person.deleteMany({ name: 'Mary' });
};

/**
 * Chain Search Query Helpers to Narrow Search Results
 * Find people who like burritos, sort by name, limit to 2, hide age
 */
const findPeopleWhoLikeBurritos = async () => {
    return Person.find({ favoriteFoods: 'burrito' })
        .sort({ name: 1 }) // Sort by name ascending
        .limit(2) // Limit to 2 documents
        .select('-age') // Exclude age field (hide age)
        .exec(); // Execute the query
};

/**
 * Main function to run all exercises sequentially
 */
const runExercises = async () => {
    try {
        console.log('\n📝 Starting Mongoose Exercises...\n');

        // Clean up
        const cleanupResult = await Person.deleteMany({});
        console.log(`🧹 Cleaned up: Deleted ${cleanupResult.deletedCount} existing person(s)\n`);

        // 1. Create and save a single person
        console.log('1️⃣ Creating and saving a person...');
        const savedPerson = await createAndSavePerson();
        console.log(`✅ Person created: ${savedPerson.name}`);
        console.log(`   ID: ${savedPerson._id}`);
        console.log(`   Favorite foods: ${savedPerson.favoriteFoods.join(', ')}`);

        // 2. Create many people
        console.log('\n2️⃣ Creating multiple people...');
        const createdPeople = await createManyPeople();
        console.log(`✅ Created ${createdPeople.length} people:`);
        createdPeople.forEach(person => {
            console.log(`   - ${person.name} (${person.age})`);
        });

        // 3. Find people by name
        console.log('\n3️⃣ Finding people named "Mary"...');
        const maryPeople = await findPeopleByName('Mary');
        console.log(`✅ Found ${maryPeople.length} person(s) named Mary:`);
        maryPeople.forEach(person => {
            console.log(`   - ${person.name} (ID: ${person._id})`);
        });

        // 4. Find one person by food
        console.log('\n4️⃣ Finding a person who likes burritos...');
        const burritoLover = await findOneByFood('burrito');
        if (burritoLover) {
            console.log(`✅ Found: ${burritoLover.name} (likes: ${burritoLover.favoriteFoods.join(', ')})`);
        } else {
            console.log('❌ No one found who likes burritos');
        }

        // 5. Find person by ID
        if (savedPerson) {
            console.log('\n5️⃣ Finding person by ID...');
            const foundById = await findPersonById(savedPerson._id);
            console.log(`✅ Found person: ${foundById.name}`);
        }

        // 6. Update person (add hamburger to favorites)
        if (savedPerson) {
            console.log('\n6️⃣ Adding hamburger to favorite foods...');
            const updatedPerson = await addFavoriteFood(savedPerson._id);
            console.log(`✅ Updated ${updatedPerson.name}'s favorite foods:`);
            console.log(`   New favorites: ${updatedPerson.favoriteFoods.join(', ')}`);
        }

        // 7. Update person age
        console.log('\n7️⃣ Updating person age to 20...');
        const updatedAgePerson = await updatePersonAge('Alice Johnson');
        if (updatedAgePerson) {
            console.log(`✅ Updated ${updatedAgePerson.name}'s age to ${updatedAgePerson.age}`);
        }

        // 8. Delete person by ID
        if (savedPerson) {
            console.log('\n8️⃣ Deleting person by ID...');
            const deletedPerson = await deletePersonById(savedPerson._id);
            console.log(`✅ Deleted person: ${deletedPerson.name}`);
        }

        // 9. Delete all Marys
        console.log('\n9️⃣ Deleting all people named Mary...');
        const deleteMaryResult = await deleteManyMary();
        console.log(`✅ Deleted ${deleteMaryResult.deletedCount} person(s) named Mary`);

        // 10. Chain search queries (should find 0 burrito lovers after Marys deleted)
        console.log('\n🔟 Finding people who like burritos (sorted, limited, age hidden)...');
        const burritoPeople = await findPeopleWhoLikeBurritos();
        console.log(`✅ Found ${burritoPeople.length} person(s) who like burritos:`);
        burritoPeople.forEach(person => {
            console.log(`   - ${person.name} (age hidden)`);
            console.log(`     Favorite foods: ${person.favoriteFoods.join(', ')}`);
        });

        console.log('\n✨ All exercises completed successfully! ✨');

    } catch (error) {
        console.error('❌ Error in exercises:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Export models and functions for testing purposes
module.exports = {
    Person,
    createAndSavePerson,
    createManyPeople,
    findPeopleByName,
    findOneByFood,
    findPersonById,
    addFavoriteFood,
    updatePersonAge,
    deletePersonById,
    deleteManyMary,
    findPeopleWhoLikeBurritos
};