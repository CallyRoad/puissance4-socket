export class GameNotFoundError extends Error {
    constructor(gameId) {
        super(`La partie "${gameId}" n'a pas été trouvé`);
    }
}

export class GameFullError extends Error {
    constructor() {
        super("La partie est complète");
    }
}

export class NotEnoughPlayerError extends Error {
    constructor() {
        super("Pas assez de joueurs (besoin de 2 joueurs)");
    }
}


//- Username errors
export class InvalidUsernameError extends Error {
    constructor() {
        super("Le pseudo ne peut être inférieur à 3 caractères et supérieurs à 20");
    }
}

export class EmptyUsernameError extends Error {
    constructor() {
        super("Le pseudo ne peut être vide");
    }
}

export class UsernameAlreadyUsedError extends Error {
    constructor() {
        super("Ce pseudo est déjà utilisé dans la partie");
    }
}