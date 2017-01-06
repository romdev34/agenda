#------------------------------------------------------------
#        Script MySQL.
#------------------------------------------------------------


#------------------------------------------------------------
# Table: message
#------------------------------------------------------------

CREATE TABLE message(
        id_message      int (11) Auto_increment  NOT NULL ,
        contenu_message Varchar (255) ,
        date            Date ,
        time            Time ,
        id_utilisateur  Int NOT NULL ,
        PRIMARY KEY (id_message )
)ENGINE=InnoDB;


#------------------------------------------------------------
# Table: utilisateur
#------------------------------------------------------------

CREATE TABLE utilisateur(
        id_utilisateur int (11) Auto_increment  NOT NULL ,
        code_client    Varchar (25) ,
        PRIMARY KEY (id_utilisateur )
)ENGINE=InnoDB;

ALTER TABLE message ADD CONSTRAINT FK_message_id_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur);
