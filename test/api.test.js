const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index'); // Ruta a tu archivo principal
const { expect } = chai;

chai.use(chaiHttp);

describe('Pokemon API', () => {
    // Test para obtener todos los Pokémon
    describe('GET /pokemon', () => {
        it('Debe devolver una lista de Pokémon', (done) => {
            chai.request(app)
                .get('/pokemon')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });

    // Test para obtener un Pokémon por ID
    describe('GET /pokemon/:id', () => {
        it('Debe devolver un Pokémon específico', (done) => {
            const id = 1; // Usa un ID válido existente en tu base de datos
            chai.request(app)
                .get(`/pokemon/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('id').eql(id);
                    done();
                });
        });

        it('Debe devolver un 404 si el Pokémon no existe', (done) => {
            const id = 9999; // Usa un ID que no exista
            chai.request(app)
                .get(`/pokemon/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error').eql('Pokémon no encontrado.');
                    done();
                });
        });
    });

    // Test para agregar un nuevo Pokémon
    describe('POST /pokemon', () => {
        it('Debe agregar un nuevo Pokémon', (done) => {
            const nuevoPokemon = {
                nombre: 'Charmander',
                tipos: 'Fuego',
                descripcion: 'Pequeño Pokémon de fuego',
                imagen: 'http://example.com/charmander.png',
            };

            chai.request(app)
                .post('/pokemon')
                .send(nuevoPokemon)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('mensaje').eql('Pokémon agregado exitosamente.');
                    expect(res.body).to.have.property('id');
                    done();
                });
        });

        it('Debe devolver un 400 si falta algún campo', (done) => {
            const incompletoPokemon = {
                nombre: 'Squirtle',
                tipos: 'Agua',
            };

            chai.request(app)
                .post('/pokemon')
                .send(incompletoPokemon)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error').eql('Todos los campos son obligatorios.');
                    done();
                });
        });
    });

    // Test para eliminar un Pokémon
    describe('DELETE /pokemon/:id', () => {
        it('Debe eliminar un Pokémon por ID', (done) => {
            const id = 1; // Asegúrate de que el ID exista antes del test
            chai.request(app)
                .delete(`/pokemon/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('mensaje').eql('Pokémon eliminado exitosamente.');
                    done();
                });
        });

        it('Debe devolver un 404 si el Pokémon no existe', (done) => {
            const id = 9999; // Usa un ID que no exista
            chai.request(app)
                .delete(`/pokemon/${id}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error').eql('Pokémon no encontrado.');
                    done();
                });
        });
    });
});
