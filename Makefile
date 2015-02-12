all: bower

py_env:
	rm -rf py_env
	virtualenv py_env
	sh -c '. py_env/bin/activate && \
		pip install nodeenv'

node_env: py_env
	rm -rf node_env
	bash -c 'source py_env/bin/activate && \
		nodeenv node_env --prebuilt'

bower: node_env bower.json
	bash -c 'source node_env/bin/activate && \
		npm install -g bower && \
		bower install && \
		bower prune'

clean:
	rm -rf py_env node_env bower_components
