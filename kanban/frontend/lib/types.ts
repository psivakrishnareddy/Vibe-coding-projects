export type Column = {
  id: string;
  title: string;
};

export type Card = {
  id: string;
  columnId: string;
  title: string;
  details: string;
};

export type BoardState = {
  columns: Column[];
  cards: Card[];
};
