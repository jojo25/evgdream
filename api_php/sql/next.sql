CREATE TABLE `activite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(45) DEFAULT NULL,
  `image` varchar(45) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `id_destination` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

INSERT INTO `activite` VALUES (1,'Quad','/img/portfolio/ect.jpg','D',1),(2,'Coffe','/img/portfolio/ect2.jpg','N',0);

CREATE TABLE `destination` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(45) DEFAULT NULL,
  `image` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `destination` VALUES (1,'Amsterdam','/img/portfolio/detsination/ect.jpg','Amsterdam la ville des putes et de la drogue');

